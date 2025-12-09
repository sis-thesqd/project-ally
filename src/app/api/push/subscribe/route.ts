import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role for server-side operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PushSubscription {
    endpoint: string;
    expirationTime: number | null;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export async function POST(request: NextRequest) {
    try {
        const subscription: PushSubscription = await request.json();

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json(
                { error: "Invalid subscription" },
                { status: 400 }
            );
        }

        // Store subscription in Supabase
        const { data, error } = await supabase
            .from("push_subscriptions")
            .upsert(
                {
                    endpoint: subscription.endpoint,
                    expiration_time: subscription.expirationTime,
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "endpoint" }
            )
            .select()
            .single();

        if (error) {
            console.error("[Push Subscribe] Supabase error:", error);
            return NextResponse.json(
                { error: "Failed to save subscription" },
                { status: 500 }
            );
        }

        console.log("[Push Subscribe] Subscription saved:", data.endpoint);

        return NextResponse.json({
            success: true,
            message: "Subscription saved",
        });
    } catch (error) {
        console.error("[Push Subscribe] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { endpoint } = await request.json();

        if (!endpoint) {
            return NextResponse.json(
                { error: "Endpoint required" },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", endpoint);

        if (error) {
            console.error("[Push Unsubscribe] Supabase error:", error);
            return NextResponse.json(
                { error: "Failed to remove subscription" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Subscription removed",
        });
    } catch (error) {
        console.error("[Push Unsubscribe] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
