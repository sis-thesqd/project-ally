"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Key } from "react-aria";
import { useInitData } from "@/contexts/InitDataContext";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { BoxIcon, MagicWandIcon } from "@/components/icons";
import { SectionHeader } from "@/components/application/section-headers/section-headers";
import { SectionLabel } from "@/components/application/section-headers/section-label";
import { updateAccountPreferences, type SubmissionMode } from "@/services/settings";

export function DefaultsContent() {
    const { data, getAccountPreferences, updateAccountPreferences: updateAccountPrefs } = useInitData();
    const [submissionMode, setSubmissionMode] = useState<SubmissionMode>("simple");
    const [isSaving, setIsSaving] = useState(false);

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

    if (accountNumber === null) {
        return (
            <div className="px-4 lg:px-8">
                <p className="text-secondary">No account found. Please select an account first.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 px-4 lg:px-8">

            <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8">
                    <SectionLabel.Root
                        size="sm"
                        title="Default submission mode"
                        description="Choose how you want to create new project requests by default."
                    />

                    <div className="flex flex-col gap-2">
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

