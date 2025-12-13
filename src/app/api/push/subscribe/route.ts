import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Lazy Supabase client initialization
function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

interface PushSubscription {
    endpoint: string;
    expirationTime: number | null;
    keys: {
        p256dh: string;
        auth: string;
    };
    email?: string;
}

export async function POST(request: NextRequest) {
    try {
        const supabase = getSupabase();
        const subscription: PushSubscription = await request.json();

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json(
                { error: "Invalid subscription" },
                { status: 400 }
            );
        }

        // Store subscription in Supabase
        const { data, error } = await supabase
            .from("pa_push_users")
            .upsert(
                {
                    endpoint: subscription.endpoint,
                    expiration_time: subscription.expirationTime,
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                    email: subscription.email || null,
                    opt_in: true,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "email" }
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
        const supabase = getSupabase();
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email required" },
                { status: 400 }
            );
        }

        // Instead of deleting, set opt_in to false to track that user opted out
        const { error } = await supabase
            .from("pa_push_users")
            .upsert(
                {
                    email: email,
                    opt_in: false,
                    updated_at: new Date().toISOString(),
                    // Clear subscription data when opting out
                    endpoint: null,
                    p256dh: null,
                    auth: null,
                    expiration_time: null,
                },
                { onConflict: "email" }
            );

        if (error) {
            console.error("[Push Unsubscribe] Supabase error:", error);
            return NextResponse.json(
                { error: "Failed to opt out of notifications" },
                { status: 500 }
            );
        }

        console.log("[Push Unsubscribe] User opted out:", email);

        return NextResponse.json({
            success: true,
            message: "Opted out of notifications",
        });
    } catch (error) {
        console.error("[Push Unsubscribe] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
