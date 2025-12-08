"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CloseButton } from "@/components/base/buttons/close-button";
import { useInitData, CONFIG_IDS } from "@/contexts/InitDataContext";
import { cx } from "@/utils/cx";

const BANNER_HEIGHT_VAR = "--global-banner-height";

export const GlobalInfoBanner = () => {
    const { data, getConfig, isReady, isBannerHidden, hideBanner } = useInitData();
    const [isDismissing, setIsDismissing] = useState(false);
    const bannerRef = useRef<HTMLDivElement>(null);

    const config = getConfig(CONFIG_IDS.GLOBAL_INFO_BANNER);
    const message = config?.content ?? "";
    const metadata = config?.metadata as { link?: string; link_label?: string; can_be_hidden?: boolean; type?: "default" | "warning" } | null;
    const link = metadata?.link ?? "#";
    const linkLabel = metadata?.link_label ?? "Learn more";
    const canBeHidden = metadata?.can_be_hidden ?? true;
    const bannerType = metadata?.type ?? "default";

    // Get user's default account
    const defaultAccount = data?.preferences?.default_account;

    // Check if banner is hidden for this account (only applies if banner can be hidden)
    const isHidden = canBeHidden && config?.id && defaultAccount ? isBannerHidden(config.id, defaultAccount) : false;

    // Update CSS variable with banner height
    const updateBannerHeight = useCallback(() => {
        if (bannerRef.current) {
            const height = bannerRef.current.offsetHeight;
            document.documentElement.style.setProperty(BANNER_HEIGHT_VAR, `${height}px`);
        }
    }, []);

    // Set banner height CSS variable when visible
    useEffect(() => {
        const shouldShow = isReady && config && !isHidden && !isDismissing;
        if (shouldShow) {
            // Use requestAnimationFrame to ensure DOM is rendered
            requestAnimationFrame(() => {
                updateBannerHeight();
            });

            // Also listen for resize
            window.addEventListener("resize", updateBannerHeight);
            return () => {
                window.removeEventListener("resize", updateBannerHeight);
            };
        } else {
            // Reset height when banner is hidden
            document.documentElement.style.setProperty(BANNER_HEIGHT_VAR, "0px");
        }
    }, [isReady, config, isHidden, isDismissing, updateBannerHeight]);

    const handleDismiss = async () => {
        setIsDismissing(true);
        document.documentElement.style.setProperty(BANNER_HEIGHT_VAR, "0px");

        // Persist to account preferences
        if (config?.id && defaultAccount) {
            await hideBanner(config.id, defaultAccount);
        }
    };

    // Don't render if not ready, no config, hidden for this account, or dismissing
    if (!isReady || !config || isHidden || isDismissing) {
        return null;
    }

    const isWarning = bannerType === "warning";

    return (
        <div
            ref={bannerRef}
            className={cx(
                "relative z-40 shrink-0 border-b",
                isWarning ? "border-warning bg-warning-secondary" : "border-brand_alt bg-brand-section_subtle md:border-brand"
            )}
        >
            <div className="p-4 md:py-3.5">
                <div className="flex flex-row flex-wrap justify-center gap-x-1.5 gap-y-0.5 text-center">
                    <p
                        className={cx("text-md font-semibold md:truncate", !isWarning && "text-primary_on-brand")}
                        style={isWarning ? { color: "#b45309" } : undefined}
                    >
                        {message}
                    </p>
                    <p
                        className={cx("text-md md:truncate", !isWarning && "text-tertiary_on-brand")}
                        style={isWarning ? { color: "#b45309" } : undefined}
                    >
                        <a
                            href={link}
                            className="rounded-xs underline underline-offset-3 outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            {linkLabel}
                        </a>
                    </p>
                </div>
            </div>
            {canBeHidden && (
                <div className="absolute top-2 right-2 md:top-1.5 md:right-2">
                    <CloseButton size="md" theme={isWarning ? "light" : "dark"} label="Dismiss" onPress={handleDismiss} />
                </div>
            )}
        </div>
    );
};
