"use client";

import { useEffect, useState } from "react";

// Get VAPID public key from environment
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function PWARegister() {
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        // Register service worker
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then((reg) => {
                    console.log("[PWA] Service worker registered:", reg.scope);
                    setRegistration(reg);

                    // Check if already subscribed
                    reg.pushManager.getSubscription().then((sub) => {
                        if (sub) {
                            console.log("[PWA] Already subscribed to push");
                            setIsSubscribed(true);
                        }
                    });
                })
                .catch((error) => {
                    console.error("[PWA] Service worker registration failed:", error);
                });
        }
    }, []);

    // Function to request notification permission and subscribe
    const subscribeToPush = async () => {
        if (!registration) {
            console.error("[PWA] No service worker registration");
            return null;
        }

        if (!VAPID_PUBLIC_KEY) {
            console.error("[PWA] VAPID public key not configured");
            return null;
        }

        try {
            // Request notification permission
            const permission = await Notification.requestPermission();
            console.log("[PWA] Notification permission:", permission);

            if (permission !== "granted") {
                console.warn("[PWA] Notification permission denied");
                return null;
            }

            // Subscribe to push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            console.log("[PWA] Push subscription:", JSON.stringify(subscription));

            // Send subscription to server
            const response = await fetch("/api/push/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(subscription),
            });

            if (response.ok) {
                console.log("[PWA] Subscription saved to server");
                setIsSubscribed(true);
                return subscription;
            } else {
                console.error("[PWA] Failed to save subscription to server");
                return null;
            }
        } catch (error) {
            console.error("[PWA] Error subscribing to push:", error);
            return null;
        }
    };

    // Expose subscribe function globally for easy access
    useEffect(() => {
        (window as unknown as { subscribeToPush?: typeof subscribeToPush }).subscribeToPush = subscribeToPush;
    }, [registration]);

    return null; // This component doesn't render anything
}

// Hook for components that need push notification functionality
export function usePushNotifications() {
    const [permission, setPermission] = useState<NotificationPermission | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        setIsSupported("Notification" in window && "serviceWorker" in navigator);
        if ("Notification" in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!isSupported) return null;

        const result = await Notification.requestPermission();
        setPermission(result);

        if (result === "granted") {
            // Trigger subscription via global function
            const subscribeFn = (window as unknown as { subscribeToPush?: () => Promise<PushSubscription | null> }).subscribeToPush;
            if (subscribeFn) {
                return subscribeFn();
            }
        }

        return null;
    };

    return {
        isSupported,
        permission,
        requestPermission,
    };
}
