"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { GeneralInfoState } from "@sis-thesqd/prf-general-info";
import type { SelectionMode } from "@sis-thesqd/prf-project-selection";
import type { DesignStyleState } from "@sis-thesqd/prf-design-style";
import type { CreativeDirectionState } from "@sis-thesqd/prf-creative-direction";
import type { DeliverableDetailsState, Project } from "@sis-thesqd/prf-deliverable-details";

interface CreateContextType {
    // Step 1: Project Selection
    mode: SelectionMode;
    setMode: (mode: SelectionMode) => void;
    selectedProjectIds: number[];
    setSelectedProjectIds: (ids: number[]) => void;
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
}

const CreateContext = createContext<CreateContextType | null>(null);

export function CreateProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<SelectionMode>("simple");
    const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [generalInfoState, setGeneralInfoState] = useState<GeneralInfoState | null>(null);
    const [designStyleState, setDesignStyleState] = useState<DesignStyleState | null>(null);
    const [creativeDirectionState, setCreativeDirectionState] = useState<CreativeDirectionState | null>(null);
    const [deliverableDetailsState, setDeliverableDetailsState] = useState<DeliverableDetailsState | null>(null);

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
