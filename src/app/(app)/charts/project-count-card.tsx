"use client";

import { useEffect, useState } from "react";
import { Zap } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { ProgressBarHalfCircle } from "@/components/base/progress-indicators/progress-circles";
import { cache } from "@/utils/cache";
import { ProgressCircleSkeleton } from "./progress-circle-skeleton";

interface TaskStatsResponse {
    account: number;
    active_tasks: number;
    cap: number;
    room: number;
    aa_queued_count: number;
}

interface ProjectCountCardProps {
    selectedAccount: number | null | undefined;
}

export const ProjectCountCard = ({ selectedAccount }: ProjectCountCardProps) => {
    const [taskStats, setTaskStats] = useState<TaskStatsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch task stats when account changes
    useEffect(() => {
        if (!selectedAccount) return;

        const cacheKey = `task-stats-${selectedAccount}`;
        const cachedData = cache.get<TaskStatsResponse>(cacheKey);
        
        if (cachedData) {
            setTaskStats(cachedData);
            setIsLoading(false);
            return;
        }

        const fetchTaskStats = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/task-stats?account=${selectedAccount}`);
                if (!response.ok) throw new Error('Failed to fetch');
                const data: TaskStatsResponse[] = await response.json();
                // Response is an array, get the first element
                const stats = data?.[0] ?? null;
                setTaskStats(stats);
                if (stats) {
                    cache.set(cacheKey, stats);
                }
            } catch (error) {
                console.error('Error fetching task stats:', error);
                setTaskStats(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTaskStats();
    }, [selectedAccount]);

    return (
        <div className="flex flex-col rounded-xl shadow-xs ring-1 ring-secondary ring-inset lg:w-90">
            <div className="flex justify-between gap-4 border-b border-secondary px-4 py-5 lg:px-6">
                <div className="flex flex-col gap-0.5 lg:gap-0">
                    <p className="text-lg font-semibold text-primary">Project count</p>
                    {isLoading ? (
                        <div className="h-5 w-48 animate-pulse rounded bg-quaternary" />
                    ) : (
                        <p className="text-sm text-tertiary">
                            {taskStats
                                ? `You're using ${Math.round((taskStats.active_tasks / taskStats.cap) * 100)}% of your active project cap.`
                                : "No data available"}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex flex-col items-center gap-6 p-6 lg:gap-8">
                {isLoading ? (
                    <ProgressCircleSkeleton />
                ) : (
                    <>
                        <div className="flex justify-center">
                            <ProgressBarHalfCircle
                                size="sm"
                                min={0}
                                max={taskStats?.cap ?? 100}
                                value={taskStats?.active_tasks ?? 0}
                                valueFormatter={(value) => value}
                            />
                        </div>
                        <div className="flex flex-col gap-1 text-center">
                            <p className="text-md font-medium text-primary">
                                {taskStats && taskStats.active_tasks >= taskStats.cap * 0.8
                                    ? "You've almost reached your limit"
                                    : "Active projects"}
                            </p>
                            <p className="text-sm text-tertiary">
                                {taskStats
                                    ? `You have ${taskStats.cap - taskStats.active_tasks} of ${taskStats.cap} available project slots.`
                                    : "No project data available"}
                            </p>
                        </div>
                    </>
                )}
            </div>
            <div className="mt-auto flex items-center justify-end border-t border-secondary px-4 py-3 lg:px-6 lg:py-4">
                <Button size="md" color="secondary" iconLeading={Zap} href="https://churchmediasquad.com/pricing" target="_blank" rel="noopener noreferrer">
                    Upgrade plan
                </Button>
            </div>
        </div>
    );
};

