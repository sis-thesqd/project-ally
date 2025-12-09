"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        // Check if running in standalone mode (PWA)
        const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

        if (!isStandalone) {
            // Not a PWA, hide immediately
            setIsVisible(false);
            return;
        }

        // Start fading out after a short delay
        const fadeTimer = setTimeout(() => {
            setIsFading(true);
        }, 500);

        // Remove from DOM after fade completes
        const hideTimer = setTimeout(() => {
            setIsVisible(false);
        }, 800);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(hideTimer);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-primary transition-opacity duration-300 ${
                isFading ? "opacity-0" : "opacity-100"
            }`}
        >
            <img
                src="/icons/icon-192x192.png"
                alt="MySquad"
                className="h-24 animate-pulse"
            />
        </div>
    );
}
