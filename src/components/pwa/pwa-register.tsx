"use client";

import { useEffect, useState } from "react";
import { useInitData } from "@/contexts/InitDataContext";

// Get VAPID public key from environment
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer as ArrayBuffer;
}

export function PWARegister() {
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const { data: initData } = useInitData();

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
    const subscribeToPush = async (userEmail?: string) => {
        console.log("[PWA] subscribeToPush called");
        console.log("[PWA] registration:", registration);
        console.log("[PWA] VAPID_PUBLIC_KEY:", VAPID_PUBLIC_KEY ? "set" : "not set");
        console.log("[PWA] userEmail parameter:", userEmail);
        console.log("[PWA] initData?.email:", initData?.email);

        // Wait for service worker to be ready
        let swRegistration = registration;
        if (!swRegistration) {
            console.log("[PWA] Waiting for service worker...");
            try {
                swRegistration = await navigator.serviceWorker.ready;
                console.log("[PWA] Service worker ready:", swRegistration);
            } catch (err) {
                console.error("[PWA] Service worker not ready:", err);
                return null;
            }
        }

        if (!VAPID_PUBLIC_KEY) {
            console.error("[PWA] VAPID public key not configured");
            alert("Push notifications not configured. Missing VAPID key.");
            return null;
        }

        // Use provided email or fallback to initData email
        const email = userEmail || initData?.email || null;
        if (!email) {
            console.error("[PWA] No email available for subscription");
            alert("Cannot subscribe: User email not available. Please try refreshing the page.");
            return null;
        }

        try {
            // Request notification permission
            console.log("[PWA] Requesting notification permission...");
            const permission = await Notification.requestPermission();
            console.log("[PWA] Notification permission:", permission);

            if (permission !== "granted") {
                console.warn("[PWA] Notification permission denied");
                return null;
            }

            // Subscribe to push
            console.log("[PWA] Creating push subscription...");
            const subscription = await swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            console.log("[PWA] Push subscription created:", JSON.stringify(subscription));

            // Send subscription to server with user email
            console.log("[PWA] Sending subscription to server with email:", email);
            const subscriptionData = {
                ...subscription.toJSON(),
                email: email,
            };
            console.log("[PWA] Subscription data:", subscriptionData);
            const response = await fetch("/api/push/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(subscriptionData),
            });

            const responseText = await response.text();
            console.log("[PWA] Server response:", response.status, responseText);

            if (response.ok) {
                console.log("[PWA] Subscription saved to server");
                setIsSubscribed(true);
                return subscription;
            } else {
                console.error("[PWA] Failed to save subscription to server:", responseText);
                alert("Failed to save subscription: " + responseText);
                return null;
            }
        } catch (error) {
            console.error("[PWA] Error subscribing to push:", error);
            alert("Error subscribing to push: " + (error instanceof Error ? error.message : String(error)));
            return null;
        }
    };

    // Expose subscribe function globally for easy access
    useEffect(() => {
        (window as unknown as { subscribeToPush?: typeof subscribeToPush }).subscribeToPush = subscribeToPush;
    }, [registration, initData]);

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

    const requestPermission = async (userEmail?: string) => {
        if (!isSupported) {
            console.log("[PWA] Push not supported");
            return null;
        }

        // Just call subscribeToPush which handles everything
        const subscribeFn = (window as unknown as { subscribeToPush?: (email?: string) => Promise<PushSubscription | null> }).subscribeToPush;
        if (subscribeFn) {
            console.log("[PWA] Calling subscribeToPush with email:", userEmail);
            const result = await subscribeFn(userEmail);
            setPermission(Notification.permission);
            return result;
        } else {
            console.error("[PWA] subscribeToPush not found on window");
            // Fallback: just request permission
            const result = await Notification.requestPermission();
            setPermission(result);
            return null;
        }
    };

    return {
        isSupported,
        permission,
        requestPermission,
    };
}
