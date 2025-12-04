"use client";

import { ProjectSelection, type SelectionMode } from "@sis-thesqd/prf-project-selection";
import { GeneralInfo, type GeneralInfoState } from "@sis-thesqd/prf-general-info";
import { useCallback, useMemo, useState } from "react";
import type { Key } from "react-aria";
import { useInitData } from "@/contexts/InitDataContext";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { projectSelectionApiConfig, projectSelectionFilterConfig, generalInfoApiConfig } from "@/config";
import { BoxIcon, MagicWandIcon } from "@/components/icons";

type FormStep = "project-selection" | "general-info";


export default function CreatePage() {
    const { data, isReady } = useInitData();
    const [mode, setMode] = useState<Set<Key>>(new Set(["simple"]));
    const [currentStep, setCurrentStep] = useState<FormStep>("project-selection");
    const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
    const [generalInfoState, setGeneralInfoState] = useState<GeneralInfoState | null>(null);

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

    // Handle project selection continue - move to general info step
    const handleProjectSelectionContinue = useCallback((selectedIds: number[]) => {
        console.log("Selected project IDs:", selectedIds);
        setSelectedProjectIds(selectedIds);
        setCurrentStep("general-info");
    }, []);

    // Handle general info back - return to project selection
    const handleGeneralInfoBack = useCallback(() => {
        setCurrentStep("project-selection");
    }, []);

    // Handle general info continue - submit the form
    const handleGeneralInfoContinue = useCallback(async (state: GeneralInfoState) => {
        console.log("General info submitted:", state);
        console.log("With selected projects:", selectedProjectIds);
        setGeneralInfoState(state);
        // TODO: Submit the complete form data to your API
    }, [selectedProjectIds]);

    // Handle general info state changes
    const handleGeneralInfoStateChange = useCallback((state: GeneralInfoState) => {
        setGeneralInfoState(state);
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

    // Render General Info step
    if (currentStep === "general-info") {
        return (
            <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
                {/* Header matching project selection */}
                <div className="pb-8 max-w-7xl mx-auto w-full">
                    <div className="min-h-[3.5rem] sm:min-h-0">
                        <h1 className="text-xl sm:text-2xl font-semibold text-primary">General Information</h1>
                        <p className="text-secondary mt-1 text-sm sm:text-base h-5 sm:h-6">
                        Help us understand your project better by providing some basic information.
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto w-full">
                    <GeneralInfo
                        apiConfig={{
                            memberId: String(memberId),
                            ...generalInfoApiConfig,
                        }}
                        selectedProjectIds={selectedProjectIds}
                        initialState={generalInfoState || undefined}
                        onStateChange={handleGeneralInfoStateChange}
                        onBack={handleGeneralInfoBack}
                        onContinue={handleGeneralInfoContinue}
                    />
                </div>
            </main>
        );
    }

    // Render Project Selection step (default)
    return (
        <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
            {/* Header with mode toggle */}
            <div className="pb-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-h-[3.5rem] sm:min-h-0">
                        <h1 className="text-xl sm:text-2xl font-semibold text-primary">New Project Request</h1>
                        <p className="text-secondary mt-1 text-sm sm:text-base h-5 sm:h-6">
                            {currentMode === "advanced" ? "Select the deliverables you need for your project." : "\u00A0"}
                        </p>
                    </div>
                    <ButtonGroup selectedKeys={mode} onSelectionChange={setMode} className="w-full sm:w-auto shrink-0">
                        <ButtonGroupItem id="simple" iconLeading={MagicWandIcon} className="flex-1 justify-center sm:flex-initial sm:justify-start">Simple</ButtonGroupItem>
                        <ButtonGroupItem id="advanced" iconLeading={BoxIcon} className="flex-1 justify-center sm:flex-initial sm:justify-start">Advanced</ButtonGroupItem>
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
                onContinue={handleProjectSelectionContinue}
                trackEvent={handleTrackEvent}
                className="max-w-7xl"
            />
        </main>
    );
}
