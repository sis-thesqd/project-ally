"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown } from "@untitledui/icons";
import { cx } from "@/utils/cx";

interface UseScrollToBottomOptions {
    /** Delay before showing the button (ms) */
    delay?: number;
    /** Distance from bottom to hide the button (px) */
    hideThreshold?: number;
    /** Whether the feature is enabled */
    enabled?: boolean;
}

export function useScrollToBottom(options: UseScrollToBottomOptions = {}) {
    const { delay = 1000, hideThreshold = 100, enabled = true } = options;
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        if (!enabled) {
            setShowButton(false);
            return;
        }

        // Find the scroll container (app uses overflow-y-auto)
        const scrollContainer = document.querySelector(".overflow-y-auto");

        const getScrollInfo = () => {
            if (scrollContainer) {
                return {
                    scrollTop: scrollContainer.scrollTop,
                    clientHeight: scrollContainer.clientHeight,
                    scrollHeight: scrollContainer.scrollHeight,
                };
            }
            return {
                scrollTop: window.scrollY,
                clientHeight: window.innerHeight,
                scrollHeight: document.documentElement.scrollHeight,
            };
        };

        const hasScrollableContent = () => {
            const { scrollHeight, clientHeight } = getScrollInfo();
            return scrollHeight > clientHeight + 50; // At least 50px of scrollable content
        };

        const isNearBottom = () => {
            const { scrollTop, clientHeight, scrollHeight } = getScrollInfo();
            return scrollTop + clientHeight >= scrollHeight - hideThreshold;
        };

        const showTimer = setTimeout(() => {
            // Only show after delay if there's scrollable content and not at bottom
            if (hasScrollableContent() && !isNearBottom()) {
                setShowButton(true);
            }
        }, delay);

        const handleScroll = () => {
            // Only show if there's scrollable content and not near bottom
            if (hasScrollableContent()) {
                setShowButton(!isNearBottom());
            } else {
                setShowButton(false);
            }
        };

        // Listen on the scroll container
        const target = scrollContainer || window;
        target.addEventListener("scroll", handleScroll);
        return () => {
            clearTimeout(showTimer);
            target.removeEventListener("scroll", handleScroll);
        };
    }, [enabled, delay, hideThreshold]);

    const scrollToBottom = useCallback(() => {
        const scrollOptions: ScrollToOptions = { top: 999999, behavior: "smooth" };

        // The app uses a specific scroll container with overflow-y-auto
        // Find it by looking for the container that actually scrolls
        const scrollContainer = document.querySelector(".overflow-y-auto");
        if (scrollContainer) {
            scrollContainer.scrollTo(scrollOptions);
        }

        // Also try window scroll as fallback
        window.scrollTo(scrollOptions);

        setShowButton(false);
    }, []);

    return { showButton, scrollToBottom };
}

interface ScrollToBottomButtonProps {
    /** Whether to show the button */
    show: boolean;
    /** Click handler */
    onClick: () => void;
    /** Additional class names */
    className?: string;
}

export function ScrollToBottomButton({ show, onClick, className }: ScrollToBottomButtonProps) {
    if (!show) return null;

    return (
        <button
            type="button"
            onClick={onClick}
            className={cx(
                "fixed bottom-4 right-4 z-50 flex items-center justify-center size-10 rounded-full md:hidden",
                "bg-tertiary/90 backdrop-blur-sm shadow-lg border border-secondary",
                "transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
                "active:scale-95",
                className
            )}
            aria-label="Scroll to bottom"
        >
            <ChevronDown className="size-5 text-secondary" />
        </button>
    );
}
