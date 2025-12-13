"use client";

import { useEffect, useState } from "react";
import { Share01, DotsHorizontal } from "@untitledui/icons";

const STORAGE_KEY = "ios-install-prompt-dismissed";

export function IOSInstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if already dismissed
        if (localStorage.getItem(STORAGE_KEY) === "true") {
            return;
        }

        // Check if on iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;

        // Check if NOT in standalone mode (already installed)
        const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

        // Check if in Safari (not Chrome on iOS, etc.)
        const isSafari = /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(navigator.userAgent);

        // Show prompt if on iOS Safari and not already installed
        if (isIOS && !isStandalone && isSafari) {
            // Delay showing the prompt
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem(STORAGE_KEY, "true");
    };

    if (!showPrompt) return null;

    return (
        <div className="animate-in slide-in-from-bottom-4 fixed inset-x-0 bottom-0 z-50 mx-4 mb-4 duration-300">
            <div className="bg-primary rounded-xl border border-primary p-4 shadow-lg">
                <div className="flex items-start gap-3">
                    {/* App icon */}
                    <img src="/icons/icon-192x192.png" alt="MySquad" className="w-12 h-auto shrink-0 rounded-xl" />
                    <div className="flex-1">
                        <h3 className="text-primary text-sm font-semibold">Install MySquad</h3>
                        <p className="text-secondary mt-0.5 text-sm">Add to your home screen for the best experience.</p>
                    </div>
                    <button onClick={handleDismiss} className="text-tertiary hover:text-secondary -mr-1 -mt-1 p-1" aria-label="Dismiss">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Instructions */}
                <div className="mt-3 rounded-lg bg-secondary px-3 py-2.5">
                    <p className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-sm text-secondary">
                        Tap
                        <Share01 className="inline h-4 w-4 text-brand-600" />
                        , tap
                        <DotsHorizontal className="inline h-4 w-4 text-primary" />
                        more, then
                        <span className="whitespace-nowrap font-medium text-primary">&quot;Add to Home Screen&quot;</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
