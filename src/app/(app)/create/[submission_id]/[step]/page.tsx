"use client";

import { useParams, useRouter } from "next/navigation";
import { ProjectSelection, type SelectionMode, type Project as ProjectSelectionProject, useProjectStore } from "@sis-thesqd/prf-project-selection";
import { GeneralInfo, type GeneralInfoState } from "@sis-thesqd/prf-general-info";
import { DesignStyle, type DesignStyleState } from "@sis-thesqd/prf-design-style";
import { CreativeDirection, type CreativeDirectionState } from "@sis-thesqd/prf-creative-direction";
import { DeliverableDetails, type DeliverableDetailsState } from "@sis-thesqd/prf-deliverable-details";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Key } from "react-aria";
import { useInitData } from "@/contexts/InitDataContext";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { projectSelectionApiConfig, projectSelectionFilterConfig, generalInfoApiConfig, designStyleApiConfig, designStyleUiConfig, creativeDirectionApiConfig, deliverableDetailsApiConfig } from "@/config";
import { BoxIcon, MagicWandIcon } from "@/components/icons";
import { cx } from "@/utils/cx";
import { Progress } from "@/components/application/progress-steps/progress-steps";
import { Box, File02, Palette, Lightbulb02, ClipboardCheck } from "@untitledui/icons";
import type { ProgressFeaturedIconType } from "@/components/application/progress-steps/progress-types";
import { useCreateContext } from "../../CreateContext";
import { notFound } from "next/navigation";
import { LoadingOverlay } from "@/components/application/loading-overlay/loading-overlay";
import { ContinueSubmissionModal } from "@/components/application/modals/continue-submission-modal";
import { getSubmission, createSubmission, detectDeviceType, type Submission } from "@/services/submissions";
import { useScrollToBottom, ScrollToBottomButton } from "@/hooks/use-scroll-to-bottom";

export default function CreateStepPage() {
    const params = useParams();
    const router = useRouter();
    const submissionId = params.submission_id as string;
    const step = params.step as string;

    const { data, isReady } = useInitData();
    const {
        submissionId: contextSubmissionId,
        setSubmissionId,
        submitter,
        setSubmitter,
        isExistingSubmission,
        setIsExistingSubmission,
        setIsFormReady,
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
        loadSubmission,
        clearFormState,
        setSelectedAccount,
        isSyncing,
    } = useCreateContext();

    // Determine if we need to load - only if context doesn't have this submission yet
    const needsLoad = contextSubmissionId !== submissionId;
    const [isLoading, setIsLoading] = useState(needsLoad);
    const [minLoadingComplete, setMinLoadingComplete] = useState(false);
    const loadStartTimeRef = useRef<number>(Date.now());

    // Modal state for hard refresh
    const [showContinueModal, setShowContinueModal] = useState(false);
    const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
    const hasCheckedForRefreshRef = useRef(false);

    // Scroll to bottom button for mobile (all steps)
    const { showButton: showScrollButton, scrollToBottom } = useScrollToBottom();

    // Minimum 1 second loading overlay
    useEffect(() => {
        loadStartTimeRef.current = Date.now();
        const timer = setTimeout(() => {
            setMinLoadingComplete(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Validate step
    if (step !== "1" && step !== "2" && step !== "3" && step !== "4" && step !== "5") {
        notFound();
    }

    // Step configuration based on imported form components
    const stepConfig = useMemo(() => [
        { step: "1", title: "Project Selection", description: "Choose your deliverables", icon: Box },
        { step: "2", title: "General Info", description: "Basic project details", icon: File02 },
        { step: "3", title: "Design Style", description: "Visual preferences", icon: Palette },
        { step: "4", title: "Creative Direction", description: "Your vision", icon: Lightbulb02 },
        { step: "5", title: "Deliverable Details", description: "Specific requirements", icon: ClipboardCheck },
    ], []);

    // Determine the furthest step the user has reached (for navigation validation)
    const furthestStep = useMemo(() => {
        // Check what data exists to determine progress
        if (deliverableDetailsState) return 5;
        if (creativeDirectionState) return 4;
        if (designStyleState) return 3;
        if (generalInfoState) return 2;
        if (selectedProjectIds.length > 0) return 1;
        return 1;
    }, [deliverableDetailsState, creativeDirectionState, designStyleState, generalInfoState, selectedProjectIds]);

    // Generate progress steps with proper status
    const progressSteps: ProgressFeaturedIconType[] = useMemo(() => {
        const currentStepNum = parseInt(step);
        return stepConfig.map((s, index) => {
            const stepNum = index + 1;
            let status: "complete" | "current" | "incomplete";
            if (stepNum < currentStepNum) {
                status = "complete";
            } else if (stepNum === currentStepNum) {
                status = "current";
            } else {
                status = "incomplete";
            }
            return {
                title: s.title,
                description: s.description,
                icon: s.icon,
                status,
                connector: index !== stepConfig.length - 1,
            };
        });
    }, [step, stepConfig]);

    // Handle step navigation via stepper
    const handleStepClick = useCallback((targetStep: number) => {
        const currentStepNum = parseInt(step);

        // Can always go back to completed steps
        if (targetStep < currentStepNum) {
            router.push(`/create/${submissionId}/${targetStep}`);
            return;
        }

        // Can go to current step (no-op)
        if (targetStep === currentStepNum) {
            return;
        }

        // Can only go forward if we've been to that step before
        if (targetStep <= furthestStep) {
            router.push(`/create/${submissionId}/${targetStep}`);
        }
    }, [step, furthestStep, router, submissionId]);

    // Clickable Stepper component
    const FormStepper = useMemo(() => {
        const currentStepNum = parseInt(step);

        return (
            <div className="w-full pb-6">
                {/* Desktop stepper - horizontal with titles only */}
                <div className="hidden md:flex justify-center">
                    <div className="max-w-4xl w-full">
                        <div className="grid items-start justify-start gap-4" style={{ gridTemplateColumns: `repeat(${stepConfig.length}, minmax(0, 1fr))` }}>
                            {progressSteps.map((item, index) => {
                                const stepNum = index + 1;
                                const isClickable = stepNum <= furthestStep || stepNum < currentStepNum;

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleStepClick(stepNum)}
                                        disabled={!isClickable}
                                        className={cx(
                                            "flex w-full flex-col items-center justify-center gap-1.5 transition-opacity",
                                            isClickable ? "cursor-pointer hover:opacity-80" : "cursor-default",
                                            !isClickable && item.status === "incomplete" && "opacity-60"
                                        )}
                                    >
                                        <div className="relative flex w-full flex-col items-center self-stretch">
                                            <div
                                                className={cx(
                                                    "z-10 flex items-center justify-center rounded-full size-6",
                                                    item.status === "complete" && "bg-brand-solid",
                                                    item.status === "incomplete" && "bg-disabled_subtle ring-[1.5px] ring-inset ring-disabled_subtle"
                                                )}
                                                style={item.status === "current" ? { backgroundColor: "rgb(113, 118, 128)" } : undefined}
                                            >
                                                {item.status === "complete" && (
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="size-3">
                                                        <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                                {item.status === "current" && (
                                                    <span className="rounded-full size-2 bg-fg-white" />
                                                )}
                                                {item.status === "incomplete" && (
                                                    <span className="rounded-full size-2 bg-fg-disabled_subtle" />
                                                )}
                                            </div>
                                            {item.connector && (
                                                <span className={cx(
                                                    "absolute top-1/2 left-[53%] z-0 w-full flex-1 -translate-y-1/2 rounded-xs border-t-2",
                                                    item.status === "complete" ? "border-brand" : "border-secondary"
                                                )} />
                                            )}
                                        </div>
                                        <p className={cx(
                                            "w-full text-center text-xs font-medium",
                                            item.status === "current" ? "text-brand-secondary" : "text-secondary"
                                        )}>{item.title}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Mobile stepper - minimal connected icons */}
                <div className="flex md:hidden w-full items-center justify-center">
                    {progressSteps.map((item, index) => {
                        const stepNum = index + 1;
                        const isClickable = stepNum <= furthestStep || stepNum < currentStepNum;

                        return (
                            <div key={index} className="flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => handleStepClick(stepNum)}
                                    disabled={!isClickable}
                                    className={cx(
                                        "z-10 flex items-center justify-center rounded-full size-6 transition-opacity",
                                        isClickable ? "cursor-pointer" : "cursor-default",
                                        item.status === "complete" && "bg-brand-solid",
                                        item.status === "incomplete" && "bg-disabled_subtle ring-[1.5px] ring-inset ring-disabled_subtle"
                                    )}
                                    style={item.status === "current" ? { backgroundColor: "rgb(113, 118, 128)" } : undefined}
                                >
                                    {item.status === "complete" && (
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="size-3">
                                            <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                    {item.status === "current" && (
                                        <span className="rounded-full size-2 bg-fg-white" />
                                    )}
                                    {item.status === "incomplete" && (
                                        <span className="rounded-full size-2 bg-fg-disabled_subtle" />
                                    )}
                                </button>
                                {index !== progressSteps.length - 1 && (
                                    <span className={cx(
                                        "w-12 flex-1 border-t-2",
                                        item.status === "complete" ? "border-brand" : "border-secondary"
                                    )} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }, [step, stepConfig, progressSteps, furthestStep, handleStepClick]);

    // Load submission from Supabase if not already loaded in context
    // On hard refresh (needsLoad=true), show the continue/start fresh modal
    useEffect(() => {
        const initSubmission = async () => {
            // If context already has this submission, we're good (client-side navigation)
            if (contextSubmissionId === submissionId) {
                setIsLoading(false);
                return;
            }

            // This is a hard refresh - check if we've already shown the modal decision
            if (hasCheckedForRefreshRef.current) {
                return;
            }
            hasCheckedForRefreshRef.current = true;

            // Fetch the submission to check if it has progress
            try {
                const submission = await getSubmission(submissionId);
                if (!submission) {
                    // Submission not found, redirect to home
                    router.push("/");
                    return;
                }

                // Check if submission has any progress (beyond initial state)
                const hasProgress =
                    submission.status === "in_progress" &&
                    ((submission.form_data.selectedProjectIds?.length ?? 0) > 0 ||
                        submission.form_data.generalInfo ||
                        submission.form_data.designStyle ||
                        submission.form_data.creativeDirection ||
                        submission.form_data.deliverableDetails);

                if (hasProgress) {
                    // Show the continue/start fresh modal
                    setExistingSubmission(submission);
                    setShowContinueModal(true);
                    setIsLoading(false);
                } else {
                    // No progress, just load the submission directly
                    await loadSubmission(submissionId);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Failed to check submission:", error);
                router.push("/");
            }
        };

        initSubmission();
    }, [submissionId, contextSubmissionId, loadSubmission, router]);

    // Set submitter from user data when available
    useEffect(() => {
        if (data && !submitter) {
            const newSubmitter = data.email || data.clickup_id?.toString() || "unknown";
            setSubmitter(newSubmitter);
        }
    }, [data, submitter, setSubmitter]);

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

    // Handle project selection changes (real-time sync to Supabase)
    const handleProjectSelectionChange = useCallback(
        (selectedIds: number[]) => {
            console.log("Project selection changed:", selectedIds);
            setSelectedProjectIds(selectedIds);
        },
        [setSelectedProjectIds]
    );

    // Handle project selection continue - move to step 2
    const handleProjectSelectionContinue = useCallback(
        (selectedIds: number[]) => {
            console.log("Selected project IDs:", selectedIds);
            setSelectedProjectIds(selectedIds);
            router.push(`/create/${submissionId}/2`);
        },
        [setSelectedProjectIds, router, submissionId]
    );

    // Handle general info back - return to step 1
    const handleGeneralInfoBack = useCallback(() => {
        router.push(`/create/${submissionId}/1`);
    }, [router, submissionId]);

    // Handle general info continue - move to step 3
    const handleGeneralInfoContinue = useCallback(
        async (state: GeneralInfoState) => {
            console.log("General info submitted:", state);
            setGeneralInfoState(state);
            router.push(`/create/${submissionId}/3`);
        },
        [setGeneralInfoState, router, submissionId]
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
        router.push(`/create/${submissionId}/2`);
    }, [router, submissionId]);

    // Handle design style continue - move to step 4
    const handleDesignStyleContinue = useCallback(
        async (state: DesignStyleState) => {
            console.log("Design style submitted:", state);
            setDesignStyleState(state);
            router.push(`/create/${submissionId}/4`);
        },
        [setDesignStyleState, router, submissionId]
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
        router.push(`/create/${submissionId}/3`);
    }, [router, submissionId]);

    // Handle creative direction continue - move to step 5
    const handleCreativeDirectionContinue = useCallback(
        async (state: CreativeDirectionState) => {
            console.log("Creative direction submitted:", state);
            setCreativeDirectionState(state);
            router.push(`/create/${submissionId}/5`);
        },
        [setCreativeDirectionState, router, submissionId]
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
        router.push(`/create/${submissionId}/4`);
    }, [router, submissionId]);

    // Get the project store actions
    const removeProjectFromStore = useProjectStore(state => state.removeProject);
    const setProjectsInStore = useProjectStore(state => state.setSelectedProjects);
    const storeSelectedProjects = useProjectStore(state => state.selectedProjects);
    const clearProjectStore = useProjectStore(state => state.clearProjects);

    // Sync CreateContext selectedProjectIds to the Zustand store on initial load only
    // This ensures the ProjectSelection component shows the correct selections when loading an existing submission
    // We use a ref to track if initial sync has been done to avoid loops
    const initialSyncDoneRef = useRef(false);
    useEffect(() => {
        // Only sync once on initial load when we have loaded selections
        if (isLoading || initialSyncDoneRef.current) return;

        // Mark as done regardless of whether we have selections
        // This prevents future syncs even if context selections change later
        initialSyncDoneRef.current = true;

        // Sync context selections to store (for existing submissions with saved selections)
        if (selectedProjectIds.length > 0) {
            setProjectsInStore(selectedProjectIds);
        }
    }, [isLoading, selectedProjectIds, setProjectsInStore]);

    // Fetch projects data when needed (e.g., when landing directly on step 5 via hard refresh)
    // This effect runs when we have selected projects but no project data
    useEffect(() => {
        // Skip if not on step 5
        if (step !== "5") return;

        // Skip if we already have projects or don't have selections
        if (allProjects.length > 0 || selectedProjectIds.length === 0) return;

        // Skip if still loading submission
        if (isLoading) return;

        let cancelled = false;

        const fetchProjects = async () => {
            try {
                const response = await fetch(projectSelectionApiConfig.projectsEndpoint);
                if (cancelled) return;

                if (!response.ok) {
                    console.error("Failed to fetch projects:", response.statusText);
                    return;
                }
                const responseData = await response.json();
                // API returns { data: [...], error: null } or { projectTypes: [...] }
                const projectsArray = responseData.data || responseData.projectTypes;
                if (cancelled) return;

                if (projectsArray && Array.isArray(projectsArray)) {
                    const mappedProjects = projectsArray.map((p: {
                        id: number;
                        title: string;
                        description?: string;
                        image_urls?: Array<{
                            url?: string;
                            sizes?: {
                                thumbnail?: string;
                                preview?: string;
                                full?: string;
                            };
                        }>;
                        filter_categories?: string[];
                        related_projects?: (string | number)[];
                    }) => ({
                        id: p.id,
                        title: p.title,
                        description: p.description || null,
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
                    if (!cancelled) {
                        setAllProjects(mappedProjects);
                    }
                }
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };

        fetchProjects();

        return () => {
            cancelled = true;
        };
    }, [step, allProjects.length, selectedProjectIds.length, isLoading, setAllProjects]);

    // Handle project removal from deliverable details
    const handleProjectRemoved = useCallback(
        (projectId: number) => {
            console.log("Project removed:", projectId);
            // Update the CreateContext state
            setSelectedProjectIds(prev => prev.filter(id => id !== projectId));
            // Also update the project selection store (used by page 1)
            removeProjectFromStore(projectId);
        },
        [setSelectedProjectIds, removeProjectFromStore]
    );

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
            console.log('[project-ally] Received state change:', {
                primaryProjectId: state.primaryProjectId,
                inProgressFormsCount: state.inProgressForms.length,
            });
            setDeliverableDetailsState(state);
        },
        [setDeliverableDetailsState]
    );

    const handleTrackEvent = useCallback((eventName: string, properties: Record<string, unknown>) => {
        console.log("Analytics event:", eventName, properties);
    }, []);

    // Handle continue existing submission from modal
    const handleContinueSubmission = useCallback(async (submission: Submission) => {
        setShowContinueModal(false);
        setIsLoading(true);

        // Mark as existing submission for QR notification
        setIsExistingSubmission(true);

        // Load the submission data into context
        await loadSubmission(submission.submission_id);

        // Sync selectedProjectIds to Zustand store
        if (submission.form_data.selectedProjectIds && submission.form_data.selectedProjectIds.length > 0) {
            setProjectsInStore(submission.form_data.selectedProjectIds);
        }

        setIsLoading(false);
    }, [loadSubmission, setIsExistingSubmission, setProjectsInStore]);

    // Handle start fresh from modal
    const handleStartFresh = useCallback(async () => {
        setShowContinueModal(false);
        setIsLoading(true);

        // Clear existing form state
        clearFormState();
        clearProjectStore();

        // Get submitter and account info
        const newSubmitter = data?.email || data?.clickup_id?.toString() || "unknown";
        const accountNumber = data?.preferences?.default_account;

        if (!accountNumber) {
            console.error("No default account configured");
            router.push("/");
            return;
        }

        try {
            // Create new submission
            const newSubmission = await createSubmission({
                submitter: newSubmitter,
                status: "started",
                form_data: {
                    mode: "simple",
                    selectedProjectIds: [],
                },
                device_last_viewed_on: detectDeviceType(),
                selected_account: accountNumber,
            });

            // Set submission data in context
            setSubmissionId(newSubmission.submission_id);
            setSubmitter(newSubmitter);
            setSelectedAccount(accountNumber);
            setMode("simple");
            setIsExistingSubmission(false);

            // Navigate to step 1 of new submission
            router.push(`/create/${newSubmission.submission_id}/1`);
        } catch (error) {
            console.error("Failed to create new submission:", error);
            router.push("/");
        }
    }, [clearFormState, clearProjectStore, data, router, setSubmissionId, setSubmitter, setSelectedAccount, setMode, setIsExistingSubmission]);

    // Handle closing the modal (same as continue)
    const handleCloseModal = useCallback(() => {
        if (existingSubmission) {
            handleContinueSubmission(existingSubmission);
        }
    }, [existingSubmission, handleContinueSubmission]);

    // Determine if we should show the loading overlay
    // Show until both: data is ready AND minimum 1 second has passed
    // Also show on step 5 if we have selected projects but no project data yet (fetching projects)
    const isLoadingProjects = step === "5" && selectedProjectIds.length > 0 && allProjects.length === 0;
    const showLoadingOverlay = isLoading || !isReady || !data || !minLoadingComplete || isLoadingProjects;

    // Set isFormReady when loading is complete (for existing submission QR trigger)
    useEffect(() => {
        if (!showLoadingOverlay && isExistingSubmission) {
            setIsFormReady(true);
        }
    }, [showLoadingOverlay, isExistingSubmission, setIsFormReady]);

    // Show loading overlay while loading submission, auth data, or minimum time hasn't elapsed
    if (showLoadingOverlay && !showContinueModal) {
        return <LoadingOverlay isVisible={true} label="Loading..." />;
    }

    // Show continue/start fresh modal on hard refresh
    if (showContinueModal) {
        return (
            <ContinueSubmissionModal
                isOpen={showContinueModal}
                onClose={handleCloseModal}
                onContinue={handleContinueSubmission}
                onStartFresh={handleStartFresh}
                existingSubmission={existingSubmission}
            />
        );
    }

    // Step 5: Deliverable Details
    if (step === "5") {
        return (
            <>
                <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto w-full">
                        {FormStepper}
                    </div>
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
                            onProjectRemoved={handleProjectRemoved}
                            trackEvent={handleTrackEvent}
                        />
                    </div>
                </main>
                <ScrollToBottomButton show={showScrollButton} onClick={scrollToBottom} />
            </>
        );
    }

    // Step 4: Creative Direction
    if (step === "4") {
        return (
            <>
                <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto w-full">
                        {FormStepper}
                    </div>
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
                <ScrollToBottomButton show={showScrollButton} onClick={scrollToBottom} />
            </>
        );
    }

    // Step 3: Design Style
    if (step === "3") {
        return (
            <>
                <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto w-full">
                        {FormStepper}
                    </div>
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

                {/* Mobile scroll to bottom button */}
                <ScrollToBottomButton show={showScrollButton} onClick={scrollToBottom} />
            </>
        );
    }

    // Step 2: General Info
    if (step === "2") {
        return (
            <>
                <main className="flex flex-col w-full p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto w-full">
                        {FormStepper}
                    </div>
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
                <ScrollToBottomButton show={showScrollButton} onClick={scrollToBottom} />
            </>
        );
    }

    // Step 1: Project Selection (default)
    return (
        <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
                {FormStepper}
            </div>
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
                onSelectionChange={handleProjectSelectionChange}
                onContinue={handleProjectSelectionContinue}
                onDataLoaded={handleProjectsDataLoaded}
                trackEvent={handleTrackEvent}
                className="max-w-7xl"
            />
        </main>
    );
}
