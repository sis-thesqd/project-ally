"use client";

import { useParams, useRouter } from "next/navigation";
import { ProjectSelection, type SelectionMode, type Project as ProjectSelectionProject } from "@sis-thesqd/prf-project-selection";
import { GeneralInfo, type GeneralInfoState } from "@sis-thesqd/prf-general-info";
import { DesignStyle, type DesignStyleState } from "@sis-thesqd/prf-design-style";
import { CreativeDirection, type CreativeDirectionState } from "@sis-thesqd/prf-creative-direction";
import { DeliverableDetails, type DeliverableDetailsState } from "@sis-thesqd/prf-deliverable-details";
import { useCallback, useMemo } from "react";
import type { Key } from "react-aria";
import { useInitData } from "@/contexts/InitDataContext";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { projectSelectionApiConfig, projectSelectionFilterConfig, generalInfoApiConfig, designStyleApiConfig, designStyleUiConfig, creativeDirectionApiConfig, deliverableDetailsApiConfig } from "@/config";
import { BoxIcon, MagicWandIcon } from "@/components/icons";
import { useCreateContext } from "../CreateContext";
import { notFound } from "next/navigation";

export default function CreateStepPage() {
    const params = useParams();
    const router = useRouter();
    const step = params.step as string;

    const { data, isReady } = useInitData();
    const {
        mode,
        setMode,
        selectedProjectIds,
        setSelectedProjectIds,
        allProjects,
        setAllProjects,
        generalInfoState,
        setGeneralInfoState,
        designStyleState,
        setDesignStyleState,
        creativeDirectionState,
        setCreativeDirectionState,
        deliverableDetailsState,
        setDeliverableDetailsState,
    } = useCreateContext();

    // Validate step
    if (step !== "1" && step !== "2" && step !== "3" && step !== "4" && step !== "5") {
        notFound();
    }

    // Get auth data from InitDataContext
    const { accountId, memberId, userId } = useMemo(() => {
        if (!data) {
            return { accountId: 0, memberId: 0, userId: "" };
        }

        const defaultAccountNumber = data.preferences?.default_account;
        const currentAccount = defaultAccountNumber
            ? data.accounts.find((a) => a.account_number === defaultAccountNumber)
            : data.accounts[0];

        return {
            accountId: currentAccount?.prf_account_id ?? 0,
            memberId: currentAccount?.account_number ?? 0,
            userId: data.clickup_id?.toString() ?? "",
        };
    }, [data]);

    // Handle mode change for button group
    const handleModeChange = useCallback(
        (keys: "all" | Set<Key>) => {
            const newMode = (Array.from(keys as Set<Key>)[0] as SelectionMode) || "simple";
            setMode(newMode);
        },
        [setMode]
    );

    // Handle projects data loaded from ProjectSelection
    // Note: setAllProjects is stable from useState, so we don't need it in deps
    const handleProjectsDataLoaded = useCallback(
        (projects: ProjectSelectionProject[]) => {
            console.log("Projects data loaded:", projects.length, "projects");
            // Map to the Project type expected by DeliverableDetails
            const mappedProjects = projects.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                image_urls: (p.image_urls || []).map(img => ({
                    url: img?.url || "",
                    sizes: img?.sizes ? {
                        thumbnail: img.sizes.thumbnail,
                        medium: img.sizes.preview,
                        large: img.sizes.full,
                    } : undefined,
                })),
                filter_categories: p.filter_categories || undefined,
                related_projects: p.related_projects,
            }));
            console.log("Setting allProjects with", mappedProjects.length, "items");
            setAllProjects(mappedProjects);
        },
        [] // setAllProjects is stable from useState
    );

    // Handle project selection continue - move to step 2
    const handleProjectSelectionContinue = useCallback(
        (selectedIds: number[]) => {
            console.log("Selected project IDs:", selectedIds);
            setSelectedProjectIds(selectedIds);
            router.push("/create/2");
        },
        [setSelectedProjectIds, router]
    );

    // Handle general info back - return to step 1
    const handleGeneralInfoBack = useCallback(() => {
        router.push("/create/1");
    }, [router]);

    // Handle general info continue - move to step 3
    const handleGeneralInfoContinue = useCallback(
        async (state: GeneralInfoState) => {
            console.log("General info submitted:", state);
            setGeneralInfoState(state);
            router.push("/create/3");
        },
        [setGeneralInfoState, router]
    );

    // Handle general info state changes
    const handleGeneralInfoStateChange = useCallback(
        (state: GeneralInfoState) => {
            setGeneralInfoState(state);
        },
        [setGeneralInfoState]
    );

    // Handle design style back - return to step 2
    const handleDesignStyleBack = useCallback(() => {
        router.push("/create/2");
    }, [router]);

    // Handle design style continue - move to step 4
    const handleDesignStyleContinue = useCallback(
        async (state: DesignStyleState) => {
            console.log("Design style submitted:", state);
            setDesignStyleState(state);
            router.push("/create/4");
        },
        [setDesignStyleState, router]
    );

    // Handle design style state changes
    const handleDesignStyleStateChange = useCallback(
        (state: DesignStyleState) => {
            setDesignStyleState(state);
        },
        [setDesignStyleState]
    );

    // Handle creative direction back - return to step 3
    const handleCreativeDirectionBack = useCallback(() => {
        router.push("/create/3");
    }, [router]);

    // Handle creative direction continue - move to step 5
    const handleCreativeDirectionContinue = useCallback(
        async (state: CreativeDirectionState) => {
            console.log("Creative direction submitted:", state);
            setCreativeDirectionState(state);
            router.push("/create/5");
        },
        [setCreativeDirectionState, router]
    );

    // Handle creative direction state changes
    const handleCreativeDirectionStateChange = useCallback(
        (state: CreativeDirectionState) => {
            setCreativeDirectionState(state);
        },
        [setCreativeDirectionState]
    );

    // Handle deliverable details back - return to step 4
    const handleDeliverableDetailsBack = useCallback(() => {
        router.push("/create/4");
    }, [router]);

    // Handle deliverable details continue - submit the form
    const handleDeliverableDetailsContinue = useCallback(
        async (state: DeliverableDetailsState) => {
            console.log("Deliverable details submitted:", state);
            console.log("With creative direction:", creativeDirectionState);
            console.log("With design style:", designStyleState);
            console.log("With general info:", generalInfoState);
            console.log("With selected projects:", selectedProjectIds);
            setDeliverableDetailsState(state);
            // TODO: Submit the complete form data to your API
            // After successful submission, redirect to success page or projects list
        },
        [creativeDirectionState, designStyleState, generalInfoState, selectedProjectIds, setDeliverableDetailsState]
    );

    // Handle deliverable details state changes
    const handleDeliverableDetailsStateChange = useCallback(
        (state: DeliverableDetailsState) => {
            setDeliverableDetailsState(state);
        },
        [setDeliverableDetailsState]
    );

    const handleTrackEvent = useCallback((eventName: string, properties: Record<string, unknown>) => {
        console.log("Analytics event:", eventName, properties);
    }, []);

    // Show loading state while auth data is loading
    if (!isReady || !data) {
        return (
            <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
                <div className="mb-6 sm:mb-8 max-w-7xl mx-auto w-full">
                    <h1 className="text-xl sm:text-2xl font-semibold text-primary align-center">New Project Request</h1>
                    <p className="text-secondary mt-1 text-sm sm:text-base">Loading...</p>
                </div>
            </main>
        );
    }

    // Step 5: Deliverable Details
    if (step === "5") {
        console.log("Step 5 rendering - selectedProjectIds:", selectedProjectIds, "allProjects count:", allProjects.length);
        return (
            <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
                <div className="pb-8 max-w-7xl mx-auto w-full">
                    <div className="min-h-[3.5rem] sm:min-h-0">
                        <h1 className="text-xl sm:text-2xl font-semibold text-primary">Deliverable Details</h1>
                        <p className="text-secondary mt-1 text-sm sm:text-base h-5 sm:h-6">
                            Add specific details for each project type you selected.
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto w-full">
                    <DeliverableDetails
                        giid="" // TODO: Generate giid during form submission
                        accountId={accountId}
                        memberId={memberId}
                        userId={userId}
                        email={data?.email || ""}
                        selectedProjectIds={selectedProjectIds}
                        allProjects={allProjects}
                        apiConfig={deliverableDetailsApiConfig}
                        initialState={deliverableDetailsState || undefined}
                        onStateChange={handleDeliverableDetailsStateChange}
                        onBack={handleDeliverableDetailsBack}
                        onContinue={handleDeliverableDetailsContinue}
                        trackEvent={handleTrackEvent}
                    />
                </div>
            </main>
        );
    }

    // Step 4: Creative Direction
    if (step === "4") {
        return (
            <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
                <div className="pb-8 max-w-7xl mx-auto w-full">
                    <div className="min-h-[3.5rem] sm:min-h-0">
                        <h1 className="text-xl sm:text-2xl font-semibold text-primary">Creative Direction</h1>
                        <p className="text-secondary mt-1 text-sm sm:text-base h-5 sm:h-6">
                            Share your vision and inspiration for this project.
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto w-full">
                    <CreativeDirection
                        apiConfig={creativeDirectionApiConfig}
                        initialState={creativeDirectionState || undefined}
                        onStateChange={handleCreativeDirectionStateChange}
                        onBack={handleCreativeDirectionBack}
                        onContinue={handleCreativeDirectionContinue}
                        trackEvent={handleTrackEvent}
                        generalInfo={generalInfoState as unknown as Record<string, unknown> | undefined}
                        designStyle={designStyleState as unknown as Record<string, unknown> | undefined}
                    />
                </div>
            </main>
        );
    }

    // Step 3: Design Style
    if (step === "3") {
        return (
            <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
                <div className="pb-8 max-w-7xl mx-auto w-full">
                    <div className="min-h-[3.5rem] sm:min-h-0">
                        <h1 className="text-xl sm:text-2xl font-semibold text-primary">Design Style</h1>
                        <p className="text-secondary mt-1 text-sm sm:text-base h-5 sm:h-6">
                            Choose a design style that best matches your vision, or skip and we'll be creative.
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto w-full">
                    <DesignStyle
                        apiConfig={{
                            memberId: String(memberId),
                            ...designStyleApiConfig,
                        }}
                        initialState={designStyleState || undefined}
                        onStateChange={handleDesignStyleStateChange}
                        onBack={handleDesignStyleBack}
                        onContinue={handleDesignStyleContinue}
                        trackEvent={handleTrackEvent}
                        showStyleGuideTabs={designStyleUiConfig.showStyleGuideTabs}
                    />
                </div>
            </main>
        );
    }

    // Step 2: General Info
    if (step === "2") {
        return (
            <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
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

    // Step 1: Project Selection (default)
    return (
        <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
            <div className="pb-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-h-[3.5rem] sm:min-h-0">
                        <h1 className="text-xl sm:text-2xl font-semibold text-primary">New Project Request</h1>
                        <p className="text-secondary mt-1 text-sm sm:text-base h-5 sm:h-6">
                            {mode === "advanced" ? "Select the deliverables you need for your project." : "\u00A0"}
                        </p>
                    </div>
                    <ButtonGroup selectedKeys={new Set([mode])} onSelectionChange={handleModeChange} className="w-full sm:w-auto shrink-0">
                        <ButtonGroupItem id="simple" iconLeading={MagicWandIcon} className="flex-1 justify-center sm:flex-initial sm:justify-start">
                            Simple
                        </ButtonGroupItem>
                        <ButtonGroupItem id="advanced" iconLeading={BoxIcon} className="flex-1 justify-center sm:flex-initial sm:justify-start">
                            Advanced
                        </ButtonGroupItem>
                    </ButtonGroup>
                </div>
            </div>

            <ProjectSelection
                accountId={accountId}
                memberId={memberId}
                userId={userId}
                apiConfig={projectSelectionApiConfig}
                filterConfig={projectSelectionFilterConfig}
                mode={mode}
                defaultFilter="squadkits"
                onContinue={handleProjectSelectionContinue}
                onDataLoaded={handleProjectsDataLoaded}
                trackEvent={handleTrackEvent}
                className="max-w-7xl"
            />
        </main>
    );
}
