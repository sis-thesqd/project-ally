"use client";

import { useEffect, useState } from "react";

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
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-solid">
                        <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
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
                <div className="mt-4 flex items-center gap-3 rounded-lg bg-secondary p-3">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-secondary">Tap</span>
                        {/* Share icon */}
                        <svg className="text-brand-600 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            />
                        </svg>
                        <span className="text-secondary">then</span>
                        <span className="text-primary font-medium">&quot;Add to Home Screen&quot;</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
