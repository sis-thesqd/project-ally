"use client";

import { useState, useEffect } from "react";
import { useInitData } from "@/contexts/InitDataContext";
import { LoadingOverlay } from "@/components/application/loading-overlay/loading-overlay";
import { ProjectSubmissionsChart } from "./(app)/charts/project-submissions-chart";
import { ProjectCountCard } from "./(app)/charts/project-count-card";

const MIN_LOADING_TIME = 2000; // 2 seconds minimum when fetching

export const Dashboard = () => {
    const { data, isReady, isFetching } = useInitData();
    const selectedAccount = data?.preferences?.default_account;
    const [showLoading, setShowLoading] = useState(false);
    const [minTimeElapsed, setMinTimeElapsed] = useState(false);
    const [startedFetching, setStartedFetching] = useState(false);

    // Show loading only when actually fetching (not using cache)
    useEffect(() => {
        if (isFetching && !startedFetching) {
            setStartedFetching(true);
            setShowLoading(true);
            setMinTimeElapsed(false);

            // Start minimum time timer
            const timer = setTimeout(() => {
                setMinTimeElapsed(true);
            }, MIN_LOADING_TIME);

            return () => clearTimeout(timer);
        }
    }, [isFetching, startedFetching]);

    // Hide loading when both data is ready and minimum time has passed (only if we were fetching)
    useEffect(() => {
        if (startedFetching && isReady && minTimeElapsed) {
            setShowLoading(false);
        }
    }, [startedFetching, isReady, minTimeElapsed]);

    return (
        <>
            <LoadingOverlay isVisible={showLoading} label="Loading your experience..." />
            <main className="flex min-w-0 flex-1 flex-col gap-8 pt-8 pb-12 overflow-y-auto">
                <div className="flex flex-col justify-between gap-4 px-4 lg:flex-row lg:px-8">
                    <p className="text-xl font-semibold text-primary lg:text-display-xs">Welcome back, {data?.name?.split(' ')[0] ?? 'User'}</p>
                </div>

                <div className="flex flex-col gap-6 px-4 lg:flex-row lg:px-8">
                    <ProjectSubmissionsChart selectedAccount={selectedAccount} />
                    <ProjectCountCard selectedAccount={selectedAccount} />
                </div>
            </main>
        </>
    );
};
