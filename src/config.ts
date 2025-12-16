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

/**
 * Design Style UI Configuration
 */
export const designStyleUiConfig = {
    /** Whether to show the Design Styles / Style Guides tabs toggle */
    showStyleGuideTabs: false,
} as const;

/**
 * Creative Direction API Configuration
 */
export const creativeDirectionApiConfig = {
    creativeVisionEndpoint: process.env.NEXT_PUBLIC_SQUAD_API_URL
        ? `${process.env.NEXT_PUBLIC_SQUAD_API_URL}/api/creative-direction/creative-vision`
        : "/api/creative-direction/creative-vision",
    uploadEndpoint: process.env.NEXT_PUBLIC_SQUAD_API_URL
        ? `${process.env.NEXT_PUBLIC_SQUAD_API_URL}/api/creative-direction/upload`
        : "/api/creative-direction/upload",
} as const;

/**
 * Deliverable Details API Configuration
 */
export const deliverableDetailsApiConfig = {
    baseUrl: process.env.NEXT_PUBLIC_SQUAD_API_URL || "https://mmq-api-vercel.vercel.app",
    formIdsEndpoint: "/api/projects/form-ids",
} as const;

/**
 * Settings Page Configuration
 * Includes command menu items and searchable settings
 */
export const settingsConfig = {
    tabs: [
        { id: "profile", label: "Profile" },
        { id: "defaults", label: "App Preferences" },
    ],
    defaultTab: "profile",
    /** Whether to show the photo uploader in profile settings */
    showPhotoUploader: false,
    /** Timezone labels for common North American timezones */
    timezones: {
        'Pacific/Honolulu': 'Hawaii Time',
        'America/Anchorage': 'Alaska Time',
        'America/Los_Angeles': 'Pacific Time',
        'America/Denver': 'Mountain Time',
        'America/Chicago': 'Central Time',
        'America/New_York': 'Eastern Time',
        'America/Halifax': 'Atlantic Time',
    },
    /** Command menu items - includes settings and navigation */
    commandMenuItems: [
        {
            id: "create",
            label: "Create new request",
            description: "Start a new project request",
            keywords: ["create", "new", "request", "project", "start"],
            href: "/create",
            icon: "Plus",
        },
        {
            id: "projects",
            label: "View projects",
            description: "See all your projects",
            keywords: ["projects", "view", "all", "list", "mmq"],
            href: "/projects",
            icon: "Box",
        },
        {
            id: "stats-weekly",
            label: "Weekly submissions",
            description: "View project submissions week by week",
            keywords: ["stats", "weekly", "submissions", "chart", "dashboard", "7", "days"],
            action: "setChartPeriod",
            chartPeriod: "weekly",
            icon: "BarChart03",
        },
        {
            id: "stats-monthly",
            label: "Monthly submissions",
            description: "View project submissions month by month",
            keywords: ["stats", "monthly", "submissions", "chart", "dashboard", "30", "days"],
            action: "setChartPeriod",
            chartPeriod: "monthly",
            icon: "BarChart12",
        },
        {
            id: "display-name",
            label: "Display name",
            description: "Change your display name",
            keywords: ["name", "username", "display", "profile", "settings"],
            tab: "profile",
            sectionId: "display-name",
            icon: "User01",
        },
        {
            id: "email",
            label: "Email address",
            description: "View your email address",
            keywords: ["email", "contact", "address", "settings"],
            tab: "profile",
            sectionId: "email",
            icon: "Mail01",
        },
        {
            id: "photo",
            label: "Profile photo",
            description: "Your profile picture",
            keywords: ["photo", "picture", "avatar", "image", "settings"],
            tab: "profile",
            sectionId: "photo",
            icon: "Image01",
        },
        {
            id: "timezone",
            label: "Timezone",
            description: "Set your timezone",
            keywords: ["timezone", "time", "zone", "location", "settings"],
            tab: "profile",
            sectionId: "timezone",
            icon: "Map01",
        },
        {
            id: "theme",
            label: "Theme",
            description: "Choose your preferred color theme",
            keywords: ["theme", "appearance", "dark", "light", "mode", "color", "settings"],
            tab: "defaults",
            sectionId: "theme",
            icon: "Sun",
        },
        {
            id: "submission-mode",
            label: "Default submission mode",
            description: "Choose between Simple and Advanced mode",
            keywords: ["submission", "mode", "simple", "advanced", "default", "request", "settings"],
            tab: "defaults",
            sectionId: "submission-mode",
            icon: "Settings01",
        },
    ],
    /** Settings-only searchable items for the settings page search */
    searchableSettings: [
        {
            id: "display-name",
            label: "Display name",
            description: "Change your display name",
            keywords: ["name", "username", "display", "profile"],
            tab: "profile",
            sectionId: "display-name",
        },
        {
            id: "email",
            label: "Email address",
            description: "View your email address",
            keywords: ["email", "contact", "address"],
            tab: "profile",
            sectionId: "email",
        },
        {
            id: "photo",
            label: "Profile photo",
            description: "Your profile picture",
            keywords: ["photo", "picture", "avatar", "image"],
            tab: "profile",
            sectionId: "photo",
        },
        {
            id: "timezone",
            label: "Timezone",
            description: "Set your timezone",
            keywords: ["timezone", "time", "zone", "location"],
            tab: "profile",
            sectionId: "timezone",
        },
        {
            id: "theme",
            label: "Theme",
            description: "Choose your preferred color theme",
            keywords: ["theme", "appearance", "dark", "light", "mode", "color"],
            tab: "defaults",
            sectionId: "theme",
        },
        {
            id: "submission-mode",
            label: "Default submission mode",
            description: "Choose between Simple and Advanced mode",
            keywords: ["submission", "mode", "simple", "advanced", "default", "request"],
            tab: "defaults",
            sectionId: "submission-mode",
        },
    ],
};
