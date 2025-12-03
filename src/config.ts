/**
 * Global application configuration
 */

export type SignInMethod = {
    id: string;
    name: string;
    enabled: boolean;
};

/**
 * Development auto-login configuration
 * Only active when NODE_ENV === 'development'
 */
export const devAuthConfig = {
    enabled: process.env.NODE_ENV === "development",
    email: "jacob@churchmediasquad.com",
};

export const authConfig = {
    /**
     * Available sign-in methods for the login page
     * - otp: Email OTP (One-Time Password) - sends a 6-digit code to the user's email
     * - google: Google OAuth sign-in
     */
    signInMethods: [
        {
            id: "otp",
            name: "Email OTP",
            enabled: true,
        },
        {
            id: "google",
            name: "Google",
            enabled: false, // Disabled for now
        },
    ] as SignInMethod[],

    /**
     * URL to redirect to after successful authentication
     */
    redirectAfterAuth: "/",

    /**
     * URL to redirect to after sign out
     */
    redirectAfterSignOut: "/login",
} as const;

/**
 * Check if a specific sign-in method is enabled
 */
export function isSignInMethodEnabled(methodId: string): boolean {
    const method = authConfig.signInMethods.find((m) => m.id === methodId);
    return method?.enabled ?? false;
}

/**
 * Get all enabled sign-in methods
 */
export function getEnabledSignInMethods(): SignInMethod[] {
    return authConfig.signInMethods.filter((m) => m.enabled);
}
