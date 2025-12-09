import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

// Configure web-push with VAPID keys
webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PushPayload {
    title?: string;
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, unknown>;
    actions?: Array<{ action: string; title: string; icon?: string }>;
}

export async function POST(request: NextRequest) {
    try {
        // Optional: Add authentication check here
        // const authHeader = request.headers.get("authorization");
        // if (authHeader !== `Bearer ${process.env.PUSH_API_KEY}`) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        const body = await request.json();
        const { subscription, payload } = body as {
            subscription?: {
                endpoint: string;
                keys: { p256dh: string; auth: string };
            };
            payload: PushPayload;
        };

        // Default notification payload
        const notificationPayload: PushPayload = {
            title: payload?.title || "MySquad",
            body: payload?.body || "You have a new notification",
            icon: payload?.icon || "/icons/icon-192x192.png",
            badge: payload?.badge || "/icons/icon-192x192.png",
            tag: payload?.tag || "mysquad-notification",
            data: payload?.data || { url: "/" },
            actions: payload?.actions,
        };

        // If a specific subscription is provided, send to just that one
        if (subscription) {
            const pushSubscription = {
                endpoint: subscription.endpoint,
                keys: subscription.keys,
            };

            await webpush.sendNotification(
                pushSubscription,
                JSON.stringify(notificationPayload)
            );

            return NextResponse.json({
                success: true,
                message: "Notification sent to specified subscription",
            });
        }

        // Otherwise, send to all subscriptions
        const { data: subscriptions, error } = await supabase
            .from("push_subscriptions")
            .select("*");

        if (error) {
            console.error("[Push Send] Supabase error:", error);
            return NextResponse.json(
                { error: "Failed to fetch subscriptions" },
                { status: 500 }
            );
        }

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json(
                { error: "No subscriptions found" },
                { status: 404 }
            );
        }

        // Send to all subscriptions
        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                    },
                };

                try {
                    await webpush.sendNotification(
                        pushSubscription,
                        JSON.stringify(notificationPayload)
                    );
                    return { endpoint: sub.endpoint, success: true };
                } catch (err) {
                    const error = err as { statusCode?: number };
                    // If subscription is expired (410 Gone), remove it
                    if (error.statusCode === 410) {
                        await supabase
                            .from("push_subscriptions")
                            .delete()
                            .eq("endpoint", sub.endpoint);
                    }
                    return { endpoint: sub.endpoint, success: false, error: String(err) };
                }
            })
        );

        const successful = results.filter(
            (r) => r.status === "fulfilled" && (r.value as { success: boolean }).success
        ).length;
        const failed = results.length - successful;

        return NextResponse.json({
            success: true,
            message: `Sent to ${successful} subscriptions, ${failed} failed`,
            details: results,
        });
    } catch (error) {
        console.error("[Push Send] Error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: String(error) },
            { status: 500 }
        );
    }
}
