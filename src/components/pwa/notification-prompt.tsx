"use client";

import { useEffect, useState } from "react";
import { usePushNotifications } from "./pwa-register";

export function NotificationPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const { isSupported, permission, requestPermission } = usePushNotifications();

    useEffect(() => {
        // Check if running in standalone PWA mode
        const standalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

        setIsStandalone(standalone);

        // Show prompt if:
        // 1. Running in standalone mode (opened from home screen)
        // 2. Push is supported
        // 3. Permission hasn't been granted or denied yet
        if (standalone && isSupported && permission === "default") {
            // Small delay to let the app load
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isSupported, permission]);

    const handleEnable = async () => {
        await requestPermission();
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Remember dismissal for this session
        sessionStorage.setItem("notification-prompt-dismissed", "true");
    };

    // Don't show if dismissed this session
    useEffect(() => {
        if (sessionStorage.getItem("notification-prompt-dismissed") === "true") {
            setShowPrompt(false);
        }
    }, []);

    if (!showPrompt) return null;

    return (
        <div className="fixed inset-x-0 bottom-20 z-50 mx-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-primary rounded-xl border border-primary p-4 shadow-lg">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-solid">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-primary text-sm font-semibold">Enable Notifications</h3>
                        <p className="text-secondary mt-0.5 text-sm">Get notified about important updates and new tasks.</p>
                    </div>
                </div>
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={handleDismiss}
                        className="text-secondary hover:bg-secondary flex-1 rounded-lg border border-primary px-4 py-2 text-sm font-medium transition-colors"
                    >
                        Not now
                    </button>
                    <button onClick={handleEnable} className="flex-1 rounded-lg bg-brand-solid px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-solid-hover">
                        Enable
                    </button>
                </div>
            </div>
        </div>
    );
}
