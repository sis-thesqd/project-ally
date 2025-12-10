import wmill
from supabase import create_client, Client
from pywebpush import webpush, WebPushException
import json

# SUPABASE CONFIG
SUPABASE_RESOURCE = wmill.get_resource("f/supabase/read-only-supabase")
SUPABASE_CLIENT: Client = create_client(SUPABASE_RESOURCE["url"], SUPABASE_RESOURCE["key"])

# VAPID CONFIG - store these in Windmill secrets
VAPID_RESOURCE = wmill.get_resource("f/project_ally/vapid_key")
VAPID_PUBLIC_KEY = VAPID_RESOURCE["public_key"]
VAPID_PRIVATE_KEY = VAPID_RESOURCE["private_key"]
VAPID_CLAIMS = {"sub": "mailto:admin@thesqd.com"}


def get_push_subscription(email: str) -> dict | None:
    """Get push subscription for a user by email"""
    result = SUPABASE_CLIENT.table("pa_push_users") \
        .select("endpoint, p256dh, auth") \
        .eq("email", email) \
        .execute()

    if not result.data or len(result.data) == 0:
        return None

    return result.data[0]


def send_push_notification(subscription: dict, body: str, link: str) -> dict:
    """Send a push notification to a subscription"""

    # Build the subscription info object
    subscription_info = {
        "endpoint": subscription["endpoint"],
        "keys": {
            "p256dh": subscription["p256dh"],
            "auth": subscription["auth"]
        }
    }

    # Build the notification payload (no title - service worker uses app name)
    payload = json.dumps({
        "body": body,
        "icon": "/icons/icon-192x192.png",
        "badge": "/icons/icon-192x192.png",
        "tag": "mysquad-notification",
        "requireInteraction": False,
        "data": {
            "url": link
        }
    })

    try:
        response = webpush(
            subscription_info=subscription_info,
            data=payload,
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims=VAPID_CLAIMS
        )
        return {
            "success": True,
            "status_code": response.status_code
        }
    except WebPushException as e:
        # If subscription is expired (410 Gone), we should remove it
        if e.response and e.response.status_code == 410:
            SUPABASE_CLIENT.table("pa_push_users") \
                .delete() \
                .eq("endpoint", subscription["endpoint"]) \
                .execute()
            return {
                "success": False,
                "error": "Subscription expired and removed",
                "status_code": 410
            }
        return {
            "success": False,
            "error": str(e),
            "status_code": e.response.status_code if e.response else None
        }


def main(email: str, body: str, link: str) -> dict:
    """
    Send a push notification to a user by email.

    Args:
        email: The user's email address (must match email in pa_push_users)
        body: The notification body text
        link: The page URL to open when notification is tapped (e.g., "/tasks/123")

    Returns:
        dict with success status and details
    """

    # Get the user's push subscription
    subscription = get_push_subscription(email)

    if not subscription:
        return {
            "success": False,
            "error": f"No push subscription found for email: {email}",
            "email": email
        }

    # Send the notification
    result = send_push_notification(subscription, body, link)

    # Add context to response
    result["email"] = email
    result["body"] = body
    result["link"] = link

    print(f"=== PUSH NOTIFICATION RESULT ===")
    print(f"Email: {email}")
    print(f"Body: {body}")
    print(f"Link: {link}")
    print(f"Success: {result.get('success')}")
    if not result.get("success"):
        print(f"Error: {result.get('error')}")

    return result
