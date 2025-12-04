import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/utils/supabase/server";
import { authConfig } from "@/config";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? authConfig.redirectAfterAuth;

    const redirectTo = request.nextUrl.clone();
    redirectTo.pathname = next;
    redirectTo.searchParams.delete("token_hash");
    redirectTo.searchParams.delete("type");
    redirectTo.searchParams.delete("code");
    redirectTo.searchParams.delete("next");

    const supabase = await createServerSupabase();

    // Handle OAuth callback (code exchange)
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect(redirectTo);
        }
    }

    // Handle email OTP/magic link callback (token_hash)
    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        });

        if (!error) {
            return NextResponse.redirect(redirectTo);
        }
    }

    // Return the user to an error page with some instructions
    redirectTo.pathname = "/login";
    redirectTo.searchParams.set("error", "auth_failed");
    return NextResponse.redirect(redirectTo);
}
