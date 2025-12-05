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

/**
 * Project Selection API Configuration
 */
export const projectSelectionApiConfig = {
    projectsEndpoint: process.env.NEXT_PUBLIC_SQUAD_API_URL
        ? `${process.env.NEXT_PUBLIC_SQUAD_API_URL}/api/projects/selection-types`
        : "/api/projects/selection-types",
    permissionsEndpoint: process.env.NEXT_PUBLIC_SQUAD_API_URL
        ? `${process.env.NEXT_PUBLIC_SQUAD_API_URL}/api/projects/permissions`
        : "/api/projects/permissions",
    mostUsedEndpoint: process.env.NEXT_PUBLIC_SQUAD_API_URL
        ? `${process.env.NEXT_PUBLIC_SQUAD_API_URL}/api/projects/most-used`
        : "/api/projects/most-used",
    turnaroundEndpoint: process.env.NEXT_PUBLIC_SQUAD_API_URL
        ? `${process.env.NEXT_PUBLIC_SQUAD_API_URL}/api/projects/turnaround-time`
        : "/api/projects/turnaround-time",
} as const;

/**
 * Project Selection Filter Configuration
 */
export const projectSelectionFilterConfig = {
    showSquadkitsFilter: true,
    showMyKitsFilter: true,
    showMostUsedFilter: true,
    showAllProjectsFilter: true,
    showDesignFilter: true,
    showVideoFilter: true,
    showSocialFilter: true,
    showWebFilter: true,
    showBrandFilter: true,
    hideUnavailableProjects: false,
} as const;

/**
 * General Info API Configuration
 */
export const generalInfoApiConfig = {
    ministriesEndpoint: process.env.NEXT_PUBLIC_SQUAD_API_URL
        ? `${process.env.NEXT_PUBLIC_SQUAD_API_URL}/api/general-info/ministries`
        : "/api/general-info/ministries",
    brandGuidesEndpoint: process.env.NEXT_PUBLIC_SQUAD_API_URL
        ? `${process.env.NEXT_PUBLIC_SQUAD_API_URL}/api/general-info/brand-guides`
        : "/api/general-info/brand-guides",
} as const;

/**
 * Design Style API Configuration
 */
export const designStyleApiConfig = {
    styleGuidesEndpoint: process.env.NEXT_PUBLIC_SQUAD_API_URL
        ? `${process.env.NEXT_PUBLIC_SQUAD_API_URL}/api/design-style/style-guides`
        : "/api/design-style/style-guides",
} as const;
