/**
 * Error Reporting Service
 *
 * Handles error reporting to webhook and displaying user-friendly toast notifications.
 */

import { toast } from "sonner";
import { IconNotification } from "@/components/application/notifications/notifications";
import { createElement } from "react";

const ERROR_WEBHOOK_URL = "https://sisx.thesqd.com/webhook/pa-error-reports-VvrGif4gRohwVOfo";

interface ErrorReportPayload {
    error: string;
    message: string;
    stack?: string;
    context?: Record<string, unknown>;
    timestamp: string;
    url?: string;
    userAgent?: string;
}

/**
 * Report an error to the webhook endpoint silently.
 */
export async function reportError(error: Error, context?: Record<string, unknown>): Promise<void> {
    try {
        const payload: ErrorReportPayload = {
            error: error.name,
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            url: typeof window !== "undefined" ? window.location.href : undefined,
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        };

        await fetch(ERROR_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    } catch {
        // Silently fail - don't throw errors from error reporting
        console.error("Failed to report error to webhook");
    }
}

/**
 * Show an error toast notification to the user.
 */
export function showErrorToast(title: string, description?: string): void {
    toast.custom((t: string | number) =>
        createElement(IconNotification, {
            title,
            description: description || "",
            color: "error",
            hideDismissLabel: true,
            onClose: () => toast.dismiss(t),
        })
    );
}

/**
 * Report an error and show a toast notification.
 * Use this for user-facing errors that should both be reported and shown to the user.
 */
export async function handleError(
    error: Error,
    userMessage: string,
    userDescription?: string,
    context?: Record<string, unknown>
): Promise<void> {
    // Report to webhook
    await reportError(error, context);

    // Show toast to user
    showErrorToast(userMessage, userDescription);
}
