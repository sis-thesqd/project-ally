"use client";

import { ProjectSelection, type SelectionMode } from "@sis-thesqd/prf-project-selection";
import { useCallback, useMemo, useState } from "react";
import type { Key } from "react-aria";
import { useInitData } from "@/contexts/InitDataContext";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { projectSelectionApiConfig, projectSelectionFilterConfig } from "@/config";
import { BoxIcon, MagicWandIcon } from "@/components/icons";


export default function CreatePage() {
    const { data, isReady } = useInitData();
    const [mode, setMode] = useState<Set<Key>>(new Set(["simple"]));

    const currentMode = (Array.from(mode)[0] as SelectionMode) || "simple";

    // Get auth data from InitDataContext
    const { accountId, memberId, userId } = useMemo(() => {
        if (!data) {
            return { accountId: 0, memberId: 0, userId: "" };
        }

        // Get the current account (default or first available)
        const defaultAccountNumber = data.preferences?.default_account;
        const currentAccount = defaultAccountNumber ? data.accounts.find((a) => a.account_number === defaultAccountNumber) : data.accounts[0];

        const result = {
            accountId: currentAccount?.prf_account_id ?? 0,
            memberId: currentAccount?.account_number ?? 0,
            userId: data.clickup_id?.toString() ?? "",
        };

        // Debug logging
        console.log("[Create] Auth data:", {
            ...result,
            currentAccount,
            clickup_id: data.clickup_id,
            accounts: data.accounts,
        });

        return result;
    }, [data]);

    const handleContinue = useCallback((selectedIds: number[]) => {
        console.log("Selected project IDs:", selectedIds);
        // TODO: Navigate to next step or handle selection
    }, []);

    const handleTrackEvent = useCallback((eventName: string, properties: Record<string, unknown>) => {
        console.log("Analytics event:", eventName, properties);
        // TODO: Send to your analytics service
    }, []);

    // Show loading state while auth data is loading
    if (!isReady || !data) {
        return (
            <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
                <div className="mb-6 sm:mb-8 max-w-7xl mx-auto w-full">
                    <h1 className="text-xl sm:text-2xl font-semibold text-primary">New Project Request</h1>
                    <p className="text-secondary mt-1 text-sm sm:text-base">Loading...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
            {/* Header with mode toggle */}
            <div className="mb-6 sm:mb-8 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-primary">New Project Request</h1>
                        <p className="text-secondary mt-1 text-sm sm:text-base">
                            {currentMode === "advanced" ? "Describe your project and let AI suggest the right deliverables." : null}
                        </p>
                    </div>
                    <ButtonGroup selectedKeys={mode} onSelectionChange={setMode}>
                        <ButtonGroupItem id="simple" iconLeading={MagicWandIcon}>Simple</ButtonGroupItem>
                        <ButtonGroupItem id="advanced" iconLeading={BoxIcon}>Advanced</ButtonGroupItem>
                    </ButtonGroup>
                </div>
            </div>

            {/* Project Selection with mode prop */}
            <ProjectSelection
                accountId={accountId}
                memberId={memberId}
                userId={userId}
                apiConfig={projectSelectionApiConfig}
                filterConfig={projectSelectionFilterConfig}
                mode={currentMode}
                defaultFilter="squadkits"
                onContinue={handleContinue}
                trackEvent={handleTrackEvent}
                className="max-w-7xl"
            />
        </main>
    );
}
