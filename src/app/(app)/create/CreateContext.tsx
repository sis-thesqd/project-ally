"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { GeneralInfoState } from "@sis-thesqd/prf-general-info";
import type { SelectionMode } from "@sis-thesqd/prf-project-selection";
import type { DesignStyleState } from "@sis-thesqd/prf-design-style";
import type { CreativeDirectionState } from "@sis-thesqd/prf-creative-direction";
import type { DeliverableDetailsState, Project } from "@sis-thesqd/prf-deliverable-details";

const STORAGE_KEY = "create-form-state";

interface CreateContextType {
    // Step 1: Project Selection
    mode: SelectionMode;
    setMode: (mode: SelectionMode) => void;
    selectedProjectIds: number[];
    setSelectedProjectIds: (ids: number[] | ((prev: number[]) => number[])) => void;
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
}

interface StoredState {
    mode: SelectionMode;
    selectedProjectIds: number[];
    allProjects: Project[];
    generalInfoState: GeneralInfoState | null;
    designStyleState: DesignStyleState | null;
    creativeDirectionState: CreativeDirectionState | null;
    deliverableDetailsState: DeliverableDetailsState | null;
}

const CreateContext = createContext<CreateContextType | null>(null);

// Helper to safely get from sessionStorage
function getStoredState(): StoredState | null {
    if (typeof window === "undefined") return null;
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as StoredState;
        }
    } catch (e) {
        console.error("Error reading from sessionStorage:", e);
    }
    return null;
}

// Helper to safely set sessionStorage
function setStoredState(state: StoredState): void {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Error writing to sessionStorage:", e);
    }
}

// Helper to clear sessionStorage
function clearStoredState(): void {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error("Error clearing sessionStorage:", e);
    }
}

export function CreateProvider({ children }: { children: ReactNode }) {
    const [isHydrated, setIsHydrated] = useState(false);
    const [mode, setModeInternal] = useState<SelectionMode>("simple");
    const [selectedProjectIds, setSelectedProjectIdsInternal] = useState<number[]>([]);
    const [allProjects, setAllProjectsInternal] = useState<Project[]>([]);
    const [generalInfoState, setGeneralInfoStateInternal] = useState<GeneralInfoState | null>(null);
    const [designStyleState, setDesignStyleStateInternal] = useState<DesignStyleState | null>(null);
    const [creativeDirectionState, setCreativeDirectionStateInternal] = useState<CreativeDirectionState | null>(null);
    const [deliverableDetailsState, setDeliverableDetailsStateInternal] = useState<DeliverableDetailsState | null>(null);

    // Load state from sessionStorage on mount
    useEffect(() => {
        const stored = getStoredState();
        if (stored) {
            console.log("Restoring form state from sessionStorage");
            setModeInternal(stored.mode);
            setSelectedProjectIdsInternal(stored.selectedProjectIds);
            setAllProjectsInternal(stored.allProjects);
            setGeneralInfoStateInternal(stored.generalInfoState);
            setDesignStyleStateInternal(stored.designStyleState);
            setCreativeDirectionStateInternal(stored.creativeDirectionState);
            setDeliverableDetailsStateInternal(stored.deliverableDetailsState);
        }
        setIsHydrated(true);
    }, []);

    // Save state to sessionStorage whenever it changes (after hydration)
    useEffect(() => {
        if (!isHydrated) return;
        const state: StoredState = {
            mode,
            selectedProjectIds,
            allProjects,
            generalInfoState,
            designStyleState,
            creativeDirectionState,
            deliverableDetailsState,
        };
        setStoredState(state);
    }, [isHydrated, mode, selectedProjectIds, allProjects, generalInfoState, designStyleState, creativeDirectionState, deliverableDetailsState]);

    // Wrapped setters that update state
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
        setModeInternal("simple");
        setSelectedProjectIdsInternal([]);
        setAllProjectsInternal([]);
        setGeneralInfoStateInternal(null);
        setDesignStyleStateInternal(null);
        setCreativeDirectionStateInternal(null);
        setDeliverableDetailsStateInternal(null);
        clearStoredState();
    }, []);

    return (
        <CreateContext.Provider
            value={{
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
