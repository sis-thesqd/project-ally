#!/usr/bin/env python3
"""
Push Notification Sender for MySquad PWA

This script sends push notifications to all subscribed devices.

Requirements:
    pip install pywebpush requests

Usage:
    python send_push_notification.py --title "Hello" --body "This is a test notification"
    python send_push_notification.py --title "New Task" --body "You have a new task assigned" --url "/tasks"

Environment Variables (or edit the constants below):
    VAPID_PUBLIC_KEY: Your VAPID public key
    VAPID_PRIVATE_KEY: Your VAPID private key
    VAPID_SUBJECT: mailto:your@email.com
    SUPABASE_URL: Your Supabase project URL
    SUPABASE_SERVICE_KEY: Your Supabase service role key
"""

import argparse
import json
import os
import sys

try:
    from pywebpush import webpush, WebPushException
    import requests
except ImportError:
    print("Required packages not installed. Run:")
    print("  pip install pywebpush requests")
    sys.exit(1)


# ============================================================================
# Configuration - Edit these or set environment variables
# ============================================================================

VAPID_PUBLIC_KEY = os.environ.get(
    "VAPID_PUBLIC_KEY",
    "BCCnavc49MwOzhBwn5QALfGvuUId4RnnoLxnrN6fSakP_yfVpJ6bquAKkAkieI5IjWZklIKH9AK9jrxSjErJ2XQ"
)

VAPID_PRIVATE_KEY = os.environ.get(
    "VAPID_PRIVATE_KEY",
    "qv1O9pM3_2AQscCmw7U6SCPuFn0OLcy9SqWv39bkhcI"
)

VAPID_SUBJECT = os.environ.get(
    "VAPID_SUBJECT",
    "mailto:jacob@thesqd.com"
)

SUPABASE_URL = os.environ.get(
    "SUPABASE_URL",
    "https://wttgwoxlezqoyzmesekt.supabase.co"
)

SUPABASE_SERVICE_KEY = os.environ.get(
    "SUPABASE_SERVICE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dGd3b3hsZXpxb3l6bWVzZWt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMzc2MTg2NCwiZXhwIjoyMDM5MzM3ODY0fQ.cyUK6hvUvj7kgkGZotJEC5PtRiekix3AAv2rpBtbU78"
)


# ============================================================================
# Functions
# ============================================================================

def get_subscriptions():
    """Fetch all push subscriptions from Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/push_subscriptions?select=*"
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print(f"Error fetching subscriptions: {response.status_code}")
        print(response.text)
        return []

    return response.json()


def delete_subscription(endpoint):
    """Delete an expired subscription from Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.{endpoint}"
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.delete(url, headers=headers)
    return response.status_code == 204


def send_notification(subscription, payload):
    """Send a push notification to a single subscription."""
    subscription_info = {
        "endpoint": subscription["endpoint"],
        "keys": {
            "p256dh": subscription["p256dh"],
            "auth": subscription["auth"]
        }
    }

    try:
        webpush(
            subscription_info=subscription_info,
            data=json.dumps(payload),
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims={
                "sub": VAPID_SUBJECT
            }
        )
        return True, None
    except WebPushException as e:
        # Check if subscription is expired (410 Gone)
        if e.response and e.response.status_code == 410:
            print(f"  Subscription expired, removing...")
            delete_subscription(subscription["endpoint"])
            return False, "expired"
        return False, str(e)


def main():
    parser = argparse.ArgumentParser(
        description="Send push notifications to MySquad PWA users"
    )
    parser.add_argument(
        "--title", "-t",
        default="MySquad",
        help="Notification title (default: MySquad)"
    )
    parser.add_argument(
        "--body", "-b",
        required=True,
        help="Notification body text"
    )
    parser.add_argument(
        "--url", "-u",
        default="/",
        help="URL to open when notification is clicked (default: /)"
    )
    parser.add_argument(
        "--tag",
        default="mysquad-notification",
        help="Notification tag for grouping (default: mysquad-notification)"
    )
    parser.add_argument(
        "--icon",
        default="/icons/icon-192x192.png",
        help="Notification icon path"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be sent without actually sending"
    )

    args = parser.parse_args()

    # Build notification payload
    payload = {
        "title": args.title,
        "body": args.body,
        "icon": args.icon,
        "badge": "/icons/icon-192x192.png",
        "tag": args.tag,
        "data": {
            "url": args.url
        }
    }

    print(f"\n📱 MySquad Push Notification Sender")
    print("=" * 40)
    print(f"Title: {args.title}")
    print(f"Body: {args.body}")
    print(f"URL: {args.url}")
    print(f"Tag: {args.tag}")
    print("=" * 40)

    # Fetch subscriptions
    print("\n🔍 Fetching subscriptions...")
    subscriptions = get_subscriptions()

    if not subscriptions:
        print("❌ No subscriptions found!")
        print("\nTo subscribe a device:")
        print("1. Open the app on iOS Safari")
        print("2. Tap 'Add to Home Screen'")
        print("3. Open the app from home screen")
        print("4. Accept notification permission when prompted")
        return 1

    print(f"✅ Found {len(subscriptions)} subscription(s)")

    if args.dry_run:
        print("\n🔸 DRY RUN - No notifications sent")
        print("\nPayload that would be sent:")
        print(json.dumps(payload, indent=2))
        return 0

    # Send notifications
    print("\n📤 Sending notifications...")

    success_count = 0
    fail_count = 0

    for i, sub in enumerate(subscriptions, 1):
        endpoint_short = sub["endpoint"][-50:] if len(sub["endpoint"]) > 50 else sub["endpoint"]
        print(f"\n[{i}/{len(subscriptions)}] Sending to ...{endpoint_short}")

        success, error = send_notification(sub, payload)

        if success:
            print(f"  ✅ Sent successfully!")
            success_count += 1
        else:
            print(f"  ❌ Failed: {error}")
            fail_count += 1

    # Summary
    print("\n" + "=" * 40)
    print(f"📊 Summary: {success_count} sent, {fail_count} failed")

    if success_count > 0:
        print("\n✨ Notifications sent! Check your device(s).")

    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
