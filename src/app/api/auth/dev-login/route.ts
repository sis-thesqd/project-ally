import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { devAuthConfig, authConfig } from "@/config";

export async function GET() {
    // Only allow in development mode
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json({ error: "Dev login only available in development mode" }, { status: 403 });
    }

    if (!devAuthConfig.enabled) {
        return NextResponse.json({ error: "Dev auto-login is disabled" }, { status: 403 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        return NextResponse.json({ error: "Service role key not configured" }, { status: 500 });
    }

    try {
        // Create admin client with service role key
        const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // Generate a magic link for the dev user
        const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
            type: "magiclink",
            email: devAuthConfig.email,
        });

        if (linkError || !linkData) {
            console.error("Dev login link error:", linkError);
            return NextResponse.json({ error: linkError?.message || "Failed to generate login link" }, { status: 500 });
        }

        // Extract the token from the magic link
        const url = new URL(linkData.properties.action_link);
        const token = url.searchParams.get("token");
        const type = url.searchParams.get("type");

        if (!token) {
            return NextResponse.json({ error: "Failed to extract token from magic link" }, { status: 500 });
        }

        // Create server client to verify the OTP and set cookies
        const cookieStore = await cookies();
        const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                },
            },
        });

        // Verify the OTP to create a session
        const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as "magiclink",
        });

        if (sessionError || !sessionData.session) {
            console.error("Dev login session error:", sessionError);
            return NextResponse.json({ error: sessionError?.message || "Failed to create session" }, { status: 500 });
        }

        // Redirect to the app
        return NextResponse.redirect(new URL(authConfig.redirectAfterAuth, "http://localhost:3000"));
    } catch (error) {
        console.error("Dev login error:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}
