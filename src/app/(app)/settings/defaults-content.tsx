"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Key } from "react-aria";
import { useTheme } from "next-themes";
import { Check, Sun, Moon01, Monitor03 } from "@untitledui/icons";
import { useInitData } from "@/contexts/InitDataContext";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { BoxIcon, MagicWandIcon } from "@/components/icons";
import { SectionLabel } from "@/components/application/section-headers/section-label";
import { updateAccountPreferences, type SubmissionMode } from "@/services/settings";

export function DefaultsContent() {
    const { data, getAccountPreferences, updateAccountPreferences: updateAccountPrefs, updatePreferences } = useInitData();
    const [submissionMode, setSubmissionMode] = useState<SubmissionMode>("simple");
    const [isSaving, setIsSaving] = useState(false);
    const { theme, setTheme } = useTheme();

    // Check if running in PWA mode
    const [isPWA, setIsPWA] = useState(false);
    useEffect(() => {
        const checkPWA = () => {
            const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
                               (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
            setIsPWA(isStandalone);
        };
        checkPWA();
    }, []);

    // Get notifications status from init data
    const notificationsEnabled = data?.notifications_enabled;

    // Get default account number
    const accountNumber = useMemo(() => {
        return data?.preferences?.default_account ?? data?.accounts?.[0]?.account_number ?? null;
    }, [data]);

    // Load current submission mode from account preferences
    useEffect(() => {
        if (accountNumber !== null) {
            const prefs = getAccountPreferences(accountNumber);
            const currentMode = prefs?.default_submission_mode || "simple";
            setSubmissionMode(currentMode);
        }
    }, [accountNumber, getAccountPreferences]);

    // Handle mode change
    const handleModeChange = useCallback(
        async (keys: "all" | Set<Key>) => {
            const newMode = (Array.from(keys as Set<Key>)[0] as SubmissionMode) || "simple";

            if (newMode === submissionMode || accountNumber === null) {
                return;
            }

            setSubmissionMode(newMode);
            setIsSaving(true);

            try {
                // Update via service
                await updateAccountPreferences(accountNumber, {
                    default_submission_mode: newMode,
                });

                // Update local state via context
                await updateAccountPrefs(accountNumber, {
                    default_submission_mode: newMode,
                });
            } catch (error) {
                console.error("Failed to update submission mode:", error);
                // Revert on error
                setSubmissionMode(submissionMode);
            } finally {
                setIsSaving(false);
            }
        },
        [submissionMode, accountNumber, updateAccountPrefs]
    );

    // Handle theme change
    const handleThemeChange = useCallback(
        async (keys: "all" | Set<Key>) => {
            const newTheme = Array.from(keys as Set<Key>)[0] as string;
            setTheme(newTheme);

            // Save to appropriate preference field based on device type
            // PWA: save to mobile_default_theme, Desktop: save to default_theme
            if (isPWA) {
                await updatePreferences({
                    mobile_default_theme: newTheme as 'system' | 'light' | 'dark'
                });
            } else {
                await updatePreferences({
                    default_theme: newTheme as 'light' | 'dark'
                });
            }
        },
        [setTheme, updatePreferences, isPWA]
    );

    if (accountNumber === null) {
        return (
            <div className="px-4 lg:px-8">
                <p className="text-secondary">No account found. Please select an account first.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 px-4 lg:px-8">

            <div className="flex flex-col gap-8">
                {/* Theme selector */}
                <div id="theme" className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8 scroll-mt-8">
                    <SectionLabel.Root
                        size="sm"
                        title="Theme"
                        description="Choose your preferred color theme"
                    />

                    <div className="flex flex-col gap-2 lg:mt-0">
                        <ButtonGroup
                            selectedKeys={new Set([
                                isPWA
                                    ? (data?.preferences?.mobile_default_theme || theme || 'system')
                                    : (data?.preferences?.default_theme || theme || 'light')
                            ])}
                            onSelectionChange={handleThemeChange}
                        >
                            {isPWA && (
                                <ButtonGroupItem id="system" iconLeading={Monitor03}>
                                    System
                                </ButtonGroupItem>
                            )}
                            <ButtonGroupItem id="light" iconLeading={Sun}>
                                Light
                            </ButtonGroupItem>
                            <ButtonGroupItem id="dark" iconLeading={Moon01}>
                                Dark
                            </ButtonGroupItem>
                        </ButtonGroup>
                    </div>
                </div>

                {/* Push Notifications Status - PWA Only */}
                {isPWA && (
                    <div id="push-notifications" className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8 scroll-mt-8">
                        <SectionLabel.Root
                            size="sm"
                            title="Push notifications"
                            description="Your push notification status"
                        />

                        <div className="flex items-center gap-2">
                            {notificationsEnabled === true ? (
                                <>
                                    <Check className="h-5 w-5 text-success-600" />
                                    <span className="text-sm font-medium text-primary">Opted in</span>
                                </>
                            ) : (
                                <span className="text-sm text-secondary">Not enabled</span>
                            )}
                        </div>
                    </div>
                )}

                <div id="submission-mode" className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8 scroll-mt-8">
                    <SectionLabel.Root
                        size="sm"
                        title="Default submission mode"
                        description="Choose your default project request mode."
                    />

                    <div className="flex flex-col gap-2 lg:mt-0">
                        <ButtonGroup
                            selectedKeys={new Set([submissionMode])}
                            onSelectionChange={handleModeChange}
                            isDisabled={isSaving}
                        >
                            <ButtonGroupItem id="simple" iconLeading={MagicWandIcon}>
                                Simple
                            </ButtonGroupItem>
                            <ButtonGroupItem id="advanced" iconLeading={BoxIcon}>
                                Advanced
                            </ButtonGroupItem>
                        </ButtonGroup>
                        {isSaving && <p className="text-sm text-secondary">Saving...</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
