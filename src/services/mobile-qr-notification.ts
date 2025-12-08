/**
 * Mobile QR Notification Service
 *
 * Shows a QR code notification after a delay when changes are made on desktop,
 * allowing users to continue the submission on their mobile device.
 */

import { toast } from "sonner";
import { createElement } from "react";
import { QRCodeNotification } from "@/components/application/notifications/notifications";

const DEFAULT_NOTIFICATION_DURATION = 30000; // 30 seconds display time
const DEFAULT_NOTIFICATION_DESCRIPTION = "Scan this QR code to continue this submission on your mobile device.";
const NOTIFICATION_DELAY = 3000; // 3 seconds delay before showing
const DESKTOP_BREAKPOINT = 1024; // lg breakpoint - only show on desktop

// Track which submission IDs have shown the notification
const shownForSubmissions = new Set<string>();
let currentToastId: string | number | null = null;
let pendingTimeoutId: NodeJS.Timeout | null = null;
let currentSubmissionId: string | null = null;
let pendingOnDontShowAgain: (() => void) | null = null;

/**
 * Check if user is on desktop (screen width >= 1024px)
 */
function isDesktop(): boolean {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= DESKTOP_BREAKPOINT;
}

interface ShowMobileQRNotificationOptions {
    submissionId: string;
    dontShowAgain?: boolean;
    onDontShowAgain?: () => void;
    /** Custom description from config */
    description?: string;
    /** Custom duration from config (in ms) */
    duration?: number;
}

/**
 * Schedule the mobile QR notification to show after a delay.
 * Only shows once per submission, and only on desktop.
 *
 * @param options.submissionId - The current submission ID
 * @param options.dontShowAgain - If true, the notification will not be shown (user preference)
 * @param options.onDontShowAgain - Callback when user clicks "Don't show again"
 */
export function showMobileQRNotification(options: ShowMobileQRNotificationOptions): void {
    const { submissionId, dontShowAgain, onDontShowAgain, description, duration } = options;
    const notificationDescription = description ?? DEFAULT_NOTIFICATION_DESCRIPTION;
    const notificationDuration = duration ?? DEFAULT_NOTIFICATION_DURATION;

    console.log("[QR Notification] showMobileQRNotification called:", {
        submissionId,
        dontShowAgain,
        alreadyShown: shownForSubmissions.has(submissionId),
        isDesktop: typeof window !== "undefined" ? isDesktop() : "N/A",
        windowWidth: typeof window !== "undefined" ? window.innerWidth : "N/A",
    });

    if (dontShowAgain) {
        console.log("[QR Notification] Skipping - dontShowAgain is true");
        return;
    }

    if (shownForSubmissions.has(submissionId)) {
        console.log("[QR Notification] Skipping - already shown for this submission");
        return;
    }
    if (typeof window === "undefined") {
        console.log("[QR Notification] Skipping - no window");
        return;
    }
    if (!isDesktop()) {
        console.log("[QR Notification] Skipping - not desktop (width < 1024)");
        return;
    }

    console.log("[QR Notification] All checks passed - scheduling notification");

    // Mark as shown for this submission
    shownForSubmissions.add(submissionId);
    currentSubmissionId = submissionId;
    pendingOnDontShowAgain = onDontShowAgain || null;

    // Clear any existing pending timeout
    if (pendingTimeoutId) {
        clearTimeout(pendingTimeoutId);
    }

    // Show after delay
    pendingTimeoutId = setTimeout(() => {
        const currentUrl = window.location.href;

        currentToastId = toast.custom(
            (t) =>
                createElement(QRCodeNotification, {
                    title: "Continue on mobile",
                    description: notificationDescription,
                    qrValue: currentUrl,
                    dontShowAgainLabel: "Don't show again",
                    onClose: () => {
                        toast.dismiss(t);
                        currentToastId = null;
                    },
                    onDontShowAgain: () => {
                        toast.dismiss(t);
                        currentToastId = null;
                        if (pendingOnDontShowAgain) {
                            pendingOnDontShowAgain();
                        }
                    },
                }),
            {
                duration: notificationDuration,
                position: "bottom-right",
                onAutoClose: () => {
                    currentToastId = null;
                },
            }
        );
        pendingTimeoutId = null;
    }, NOTIFICATION_DELAY);
}

/**
 * Reset the notification state for a specific submission.
 * Call this when starting a new submission.
 */
export function resetMobileQRNotification(submissionId?: string): void {
    if (submissionId) {
        shownForSubmissions.delete(submissionId);
    }
    if (pendingTimeoutId) {
        clearTimeout(pendingTimeoutId);
        pendingTimeoutId = null;
    }
    if (currentToastId !== null) {
        toast.dismiss(currentToastId);
        currentToastId = null;
    }
    currentSubmissionId = null;
}

/**
 * Check if the notification has already been shown for a submission.
 */
export function hasShownMobileQRNotification(submissionId: string): boolean {
    return shownForSubmissions.has(submissionId);
}
