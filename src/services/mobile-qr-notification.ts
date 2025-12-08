/**
 * Mobile QR Notification Service
 *
 * Shows a QR code notification after a delay when changes are made on desktop,
 * allowing users to continue the submission on their mobile device.
 */

import { toast } from "sonner";
import { createElement } from "react";
import { QRCodeNotification } from "@/components/application/notifications/notifications";

const NOTIFICATION_DURATION = 30000; // 30 seconds display time
const NOTIFICATION_DELAY = 3000; // 3 seconds delay before showing
const DESKTOP_BREAKPOINT = 1024; // lg breakpoint - only show on desktop

// Track which submission IDs have shown the notification
const shownForSubmissions = new Set<string>();
let currentToastId: string | number | null = null;
let pendingTimeoutId: NodeJS.Timeout | null = null;
let currentSubmissionId: string | null = null;

/**
 * Check if user is on desktop (screen width >= 1024px)
 */
function isDesktop(): boolean {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= DESKTOP_BREAKPOINT;
}

/**
 * Schedule the mobile QR notification to show after a delay.
 * Only shows once per submission, and only on desktop.
 */
export function showMobileQRNotification(submissionId: string): void {
    console.log("[MobileQR] showMobileQRNotification called with submissionId:", submissionId);
    console.log("[MobileQR] Already shown for this submission:", shownForSubmissions.has(submissionId));
    console.log("[MobileQR] Is desktop:", isDesktop());
    console.log("[MobileQR] Window width:", typeof window !== "undefined" ? window.innerWidth : "SSR");

    if (shownForSubmissions.has(submissionId)) {
        console.log("[MobileQR] Skipping - already shown for this submission");
        return;
    }
    if (typeof window === "undefined") {
        console.log("[MobileQR] Skipping - SSR environment");
        return;
    }
    if (!isDesktop()) {
        console.log("[MobileQR] Skipping - not desktop");
        return;
    }

    console.log("[MobileQR] All checks passed, scheduling notification");
    // Mark as shown for this submission
    shownForSubmissions.add(submissionId);
    currentSubmissionId = submissionId;

    // Clear any existing pending timeout
    if (pendingTimeoutId) {
        clearTimeout(pendingTimeoutId);
    }

    // Show after delay
    pendingTimeoutId = setTimeout(() => {
        console.log("[MobileQR] Timeout fired, showing toast now");
        const currentUrl = window.location.href;
        console.log("[MobileQR] Current URL for QR:", currentUrl);

        currentToastId = toast.custom(
            (t) =>
                createElement(QRCodeNotification, {
                    title: "Continue on mobile",
                    description: "Scan this QR code to continue this submission on your mobile device.",
                    qrValue: currentUrl,
                    dontShowAgainLabel: "Don't show again",
                    onClose: () => {
                        toast.dismiss(t);
                        currentToastId = null;
                    },
                    onDontShowAgain: () => {
                        toast.dismiss(t);
                        currentToastId = null;
                        // This will be wired up later to persist the preference
                        console.log("User requested to not show mobile QR notification again");
                    },
                }),
            {
                duration: NOTIFICATION_DURATION,
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
