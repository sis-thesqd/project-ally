"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import type { GeneralInfoState } from "@sis-thesqd/prf-general-info";
import type { SelectionMode } from "@sis-thesqd/prf-project-selection";
import type { DesignStyleState } from "@sis-thesqd/prf-design-style";
import type { CreativeDirectionState } from "@sis-thesqd/prf-creative-direction";
import type { DeliverableDetailsState, Project } from "@sis-thesqd/prf-deliverable-details";
import { upsertSubmission, getSubmission, detectDeviceType, type SubmissionFormData } from "@/services/submissions";

interface CreateContextType {
    // Submission ID
    submissionId: string | null;
    setSubmissionId: (id: string | null) => void;
    submitter: string | null;
    setSubmitter: (submitter: string | null) => void;

    // Account context (set when form is created)
    selectedAccount: number | null;
    setSelectedAccount: (account: number | null) => void;

    // Step 1: Project Selection
    mode: SelectionMode;
    setMode: (mode: SelectionMode) => void;
    selectedProjectIds: number[];
    setSelectedProjectIds: (ids: number[] | ((prev: number[]) => number[])) => void;
    // allProjects is NOT persisted - it's fetched fresh from API on each page load
    allProjects: Project[];
    setAllProjects: (projects: Project[]) => void;

    // Step 2: General Info
    generalInfoState: GeneralInfoState | null;
    setGeneralInfoState: (state: GeneralInfoState | null) => void;

    // Step 3: Design Style
    designStyleState: DesignStyleState | null;
    setDesignStyleState: (state: DesignStyleState | null) => void;

    // Step 4: Creative Direction
    creativeDirectionState: CreativeDirectionState | null;
    setCreativeDirectionState: (state: CreativeDirectionState | null) => void;

    // Step 5: Deliverable Details
    deliverableDetailsState: DeliverableDetailsState | null;
    setDeliverableDetailsState: (state: DeliverableDetailsState | null) => void;

    // Clear all state
    clearFormState: () => void;

    // Sync status
    isSyncing: boolean;
    lastSyncError: string | null;

    // Load submission from Supabase
    loadSubmission: (submissionId: string) => Promise<boolean>;
}

const CreateContext = createContext<CreateContextType | null>(null);

export function CreateProvider({ children }: { children: ReactNode }) {
    const [isHydrated, setIsHydrated] = useState(false);
    const [submissionId, setSubmissionIdInternal] = useState<string | null>(null);
    const [submitter, setSubmitterInternal] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccountInternal] = useState<number | null>(null);
    const [mode, setModeInternal] = useState<SelectionMode>("simple");
    const [selectedProjectIds, setSelectedProjectIdsInternal] = useState<number[]>([]);
    // allProjects is local state only - fetched fresh from API, NOT persisted to Supabase
    const [allProjects, setAllProjectsInternal] = useState<Project[]>([]);
    const [generalInfoState, setGeneralInfoStateInternal] = useState<GeneralInfoState | null>(null);
    const [designStyleState, setDesignStyleStateInternal] = useState<DesignStyleState | null>(null);
    const [creativeDirectionState, setCreativeDirectionStateInternal] = useState<CreativeDirectionState | null>(null);
    const [deliverableDetailsState, setDeliverableDetailsStateInternal] = useState<DeliverableDetailsState | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncError, setLastSyncError] = useState<string | null>(null);

    // Track if we should sync to Supabase (debounced)
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isLoadingRef = useRef(false);

    // Mark as hydrated on mount (no sessionStorage restore)
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Sync to Supabase when form data changes (debounced)
    // Only syncs essential user-input data - NOT allProjects (which is fetched from API)
    useEffect(() => {
        if (!isHydrated || !submissionId || !submitter || isLoadingRef.current) return;

        // Clear existing timeout
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }

        // Debounce the sync
        syncTimeoutRef.current = setTimeout(async () => {
            setIsSyncing(true);
            setLastSyncError(null);

            // Simplified payload - only essential user input data
            // allProjects is NOT included - it's fetched fresh from API
            // Keys ordered by page/step in form wizard
            const formData: SubmissionFormData = {
                selectedAccount,
                mode,
                selectedProjectIds,
                generalInfo: generalInfoState,
                designStyle: designStyleState,
                creativeDirection: creativeDirectionState,
                deliverableDetails: deliverableDetailsState,
            };

            try {
                await upsertSubmission({
                    submission_id: submissionId,
                    submitter,
                    status: "in_progress",
                    form_data: formData,
                    device_last_viewed_on: detectDeviceType(),
                });
                console.log("Synced submission to Supabase");
            } catch (error) {
                console.error("Failed to sync submission:", error);
                setLastSyncError(error instanceof Error ? error.message : "Unknown error");
            } finally {
                setIsSyncing(false);
            }
        }, 1000); // 1 second debounce

        return () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [isHydrated, submissionId, submitter, selectedAccount, mode, selectedProjectIds, generalInfoState, designStyleState, creativeDirectionState, deliverableDetailsState]);

    // Wrapped setters that update state
    const setSubmissionId = useCallback((id: string | null) => {
        setSubmissionIdInternal(id);
    }, []);

    const setSubmitter = useCallback((value: string | null) => {
        setSubmitterInternal(value);
    }, []);

    const setSelectedAccount = useCallback((account: number | null) => {
        setSelectedAccountInternal(account);
    }, []);

    const setMode = useCallback((newMode: SelectionMode) => {
        setModeInternal(newMode);
    }, []);

    const setSelectedProjectIds = useCallback((ids: number[] | ((prev: number[]) => number[])) => {
        if (typeof ids === "function") {
            setSelectedProjectIdsInternal(ids);
        } else {
            setSelectedProjectIdsInternal(ids);
        }
    }, []);

    const setAllProjects = useCallback((projects: Project[]) => {
        setAllProjectsInternal(projects);
    }, []);

    const setGeneralInfoState = useCallback((state: GeneralInfoState | null) => {
        setGeneralInfoStateInternal(state);
    }, []);

    const setDesignStyleState = useCallback((state: DesignStyleState | null) => {
        setDesignStyleStateInternal(state);
    }, []);

    const setCreativeDirectionState = useCallback((state: CreativeDirectionState | null) => {
        setCreativeDirectionStateInternal(state);
    }, []);

    const setDeliverableDetailsState = useCallback((state: DeliverableDetailsState | null) => {
        // Only update if state actually changed to prevent re-render loops
        setDeliverableDetailsStateInternal(prev => {
            if (JSON.stringify(prev) === JSON.stringify(state)) {
                return prev;
            }
            return state;
        });
    }, []);

    const clearFormState = useCallback(() => {
        setSubmissionIdInternal(null);
        setSubmitterInternal(null);
        setSelectedAccountInternal(null);
        setModeInternal("simple");
        setSelectedProjectIdsInternal([]);
        setAllProjectsInternal([]);
        setGeneralInfoStateInternal(null);
        setDesignStyleStateInternal(null);
        setCreativeDirectionStateInternal(null);
        setDeliverableDetailsStateInternal(null);
    }, []);

    // Load submission from Supabase
    // Note: allProjects is NOT loaded from Supabase - it's fetched fresh from API
    const loadSubmission = useCallback(async (id: string): Promise<boolean> => {
        isLoadingRef.current = true;
        try {
            const submission = await getSubmission(id);
            if (!submission) {
                isLoadingRef.current = false;
                return false;
            }

            const formData = submission.form_data;
            setSubmissionIdInternal(submission.submission_id);
            setSubmitterInternal(submission.submitter);
            setSelectedAccountInternal(formData.selectedAccount ?? null);
            setModeInternal((formData.mode as SelectionMode) || "simple");
            setSelectedProjectIdsInternal(formData.selectedProjectIds || []);
            // allProjects is NOT restored - it will be fetched from API on the form page
            setGeneralInfoStateInternal((formData.generalInfo as GeneralInfoState) || null);
            setDesignStyleStateInternal((formData.designStyle as DesignStyleState) || null);
            setCreativeDirectionStateInternal((formData.creativeDirection as CreativeDirectionState) || null);
            setDeliverableDetailsStateInternal((formData.deliverableDetails as DeliverableDetailsState) || null);

            console.log("Loaded submission from Supabase:", id);
            isLoadingRef.current = false;
            return true;
        } catch (error) {
            console.error("Failed to load submission:", error);
            isLoadingRef.current = false;
            return false;
        }
    }, []);

    return (
        <CreateContext.Provider
            value={{
                submissionId,
                setSubmissionId,
                submitter,
                setSubmitter,
                selectedAccount,
                setSelectedAccount,
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
                clearFormState,
                isSyncing,
                lastSyncError,
                loadSubmission,
            }}
        >
            {children}
        </CreateContext.Provider>
    );
}

export function useCreateContext() {
    const context = useContext(CreateContext);
    if (!context) {
        throw new Error("useCreateContext must be used within CreateProvider");
    }
    return context;
}
