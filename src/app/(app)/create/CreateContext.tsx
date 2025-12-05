"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { GeneralInfoState } from "@sis-thesqd/prf-general-info";
import type { SelectionMode } from "@sis-thesqd/prf-project-selection";
import type { DesignStyleState } from "@sis-thesqd/prf-design-style";

interface CreateContextType {
    // Step 1: Project Selection
    mode: SelectionMode;
    setMode: (mode: SelectionMode) => void;
    selectedProjectIds: number[];
    setSelectedProjectIds: (ids: number[]) => void;

    // Step 2: General Info
    generalInfoState: GeneralInfoState | null;
    setGeneralInfoState: (state: GeneralInfoState | null) => void;

    // Step 3: Design Style
    designStyleState: DesignStyleState | null;
    setDesignStyleState: (state: DesignStyleState | null) => void;
}

const CreateContext = createContext<CreateContextType | null>(null);

export function CreateProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<SelectionMode>("simple");
    const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
    const [generalInfoState, setGeneralInfoState] = useState<GeneralInfoState | null>(null);
    const [designStyleState, setDesignStyleState] = useState<DesignStyleState | null>(null);

    return (
        <CreateContext.Provider
            value={{
                mode,
                setMode,
                selectedProjectIds,
                setSelectedProjectIds,
                generalInfoState,
                setGeneralInfoState,
                designStyleState,
                setDesignStyleState,
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
