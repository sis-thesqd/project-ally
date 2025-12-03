"use client";

import { ProjectSelection, type ProjectSelectionProps } from "@sis-thesqd/prf-project-selection";
import { useCallback, useMemo } from "react";
import { useInitData } from "@/contexts/InitDataContext";

// API configuration - update these endpoints based on your deployment
const API_CONFIG: ProjectSelectionProps["apiConfig"] = {
    projectsEndpoint: process.env.NEXT_PUBLIC_SQUAD_API_URL
        ? `${process.env.NEXT_PUBLIC_SQUAD_API_URL}/api/projects/selection-types`
        : "/api/projects/selection-types",
    permissionsEndpoint: process.env.NEXT_PUBLIC_SQUAD_API_URL
        ? `${process.env.NEXT_PUBLIC_SQUAD_API_URL}/api/projects/permissions`
        : "/api/projects/permissions",
    mostUsedEndpoint: process.env.NEXT_PUBLIC_SQUAD_API_URL
        ? `${process.env.NEXT_PUBLIC_SQUAD_API_URL}/api/projects/most-used`
        : "/api/projects/most-used",
    turnaroundEndpoint: process.env.NEXT_PUBLIC_SQUAD_API_URL
        ? `${process.env.NEXT_PUBLIC_SQUAD_API_URL}/api/projects/turnaround-time`
        : "/api/projects/turnaround-time",
};

// Filter configuration
const FILTER_CONFIG: ProjectSelectionProps["filterConfig"] = {
    showSquadkitsFilter: true,
    showMyKitsFilter: true,
    showMostUsedFilter: true,
    showAllProjectsFilter: true,
    showDesignFilter: true,
    showVideoFilter: true,
    showSocialFilter: true,
    showWebFilter: true,
    showBrandFilter: true,
    hideUnavailableProjects: false,
};

export default function CreatePage() {
    const { data, isReady } = useInitData();

    // Get auth data from InitDataContext
    const { accountId, memberId, userId } = useMemo(() => {
        if (!data) {
            return { accountId: 0, memberId: 0, userId: "" };
        }

        // Get the current account (default or first available)
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
            <main className="flex flex-1 flex-col p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-primary">Create New Request</h1>
                    <p className="text-secondary mt-1">Loading...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-1 flex-col p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-primary">Create New Request</h1>
                <p className="text-secondary mt-1">Select the projects you need for your request.</p>
            </div>

            <ProjectSelection
                accountId={accountId}
                memberId={memberId}
                userId={userId}
                apiConfig={API_CONFIG}
                filterConfig={FILTER_CONFIG}
                defaultFilter="squadkits"
                onContinue={handleContinue}
                trackEvent={handleTrackEvent}
                className="max-w-7xl"
            />
        </main>
    );
}
