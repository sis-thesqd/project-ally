"use client";

import { useInitData } from "@/contexts/InitDataContext";
import { ProjectSubmissionsChart } from "./(app)/charts/project-submissions-chart";
import { ProjectCountCard } from "./(app)/charts/project-count-card";

export const Dashboard = () => {
    const { data } = useInitData();
    const selectedAccount = data?.preferences?.default_account;

    return (
        <main className="flex min-w-0 flex-1 flex-col gap-8 pt-8 pb-12 overflow-y-hidden lg:overflow-y-auto">
                <div className="flex flex-col justify-between gap-4 px-4 lg:flex-row lg:px-8">
                    <p className="text-xl font-semibold text-primary lg:text-display-xs">Welcome back, {data?.name?.split(' ')[0] ?? 'User'}</p>
                </div>

                <div className="flex flex-col gap-6 px-4 lg:flex-row lg:px-8">
                    <ProjectSubmissionsChart selectedAccount={selectedAccount} />
                    <ProjectCountCard selectedAccount={selectedAccount} />
                </div>
            </main>
    );
};
