"use client";

import { useEffect, useState } from "react";
import {
    Zap,
    Eye,
} from "@untitledui/icons";
import { Bar, BarChart, CartesianGrid, Label, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Button } from "@/components/base/buttons/button";
import { ProgressBarHalfCircle } from "@/components/base/progress-indicators/progress-circles";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { useInitData } from "@/contexts/InitDataContext";

interface WeeklyCount {
    week_start: string;
    count: number;
}

interface MonthlyCount {
    month_start: string;
    count: number;
}

interface AccountStatsResponse {
    weekly_counts: WeeklyCount[];
    monthly_counts: MonthlyCount[];
}

interface ChartDataPoint {
    date: string;
    count: number;
}

interface TaskStatsResponse {
    account: number;
    active_tasks: number;
    cap: number;
    room: number;
    aa_queued_count: number;
}

const colors: Record<string, string> = {
    count: "text-utility-brand-600",
};

type ViewMode = "weekly" | "monthly";

export const Dashboard = () => {
    const isDesktop = useBreakpoint("lg");
    const [viewMode, setViewMode] = useState<ViewMode>("monthly");
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { data } = useInitData();

    const selectedAccount = data?.preferences?.default_account;

    const [statsData, setStatsData] = useState<AccountStatsResponse | null>(null);
    const [taskStats, setTaskStats] = useState<TaskStatsResponse | null>(null);

    // Fetch task stats when account changes
    useEffect(() => {
        if (!selectedAccount) return;

        const fetchTaskStats = async () => {
            try {
                const response = await fetch(`/api/task-stats?account=${selectedAccount}`);
                if (!response.ok) throw new Error('Failed to fetch');
                const data: TaskStatsResponse[] = await response.json();
                // Response is an array, get the first element
                setTaskStats(data?.[0] ?? null);
            } catch (error) {
                console.error('Error fetching task stats:', error);
                setTaskStats(null);
            }
        };

        fetchTaskStats();
    }, [selectedAccount]);

    // Fetch chart data when account changes
    useEffect(() => {
        if (!selectedAccount) return;

        const fetchChartData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/account-stats?account=${selectedAccount}`);
                if (!response.ok) throw new Error('Failed to fetch');
                const rawData: AccountStatsResponse = await response.json();
                setStatsData(rawData);
            } catch (error) {
                console.error('Error fetching chart data:', error);
                setStatsData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChartData();
    }, [selectedAccount]);

    // Transform data based on view mode
    useEffect(() => {
        if (!statsData) {
            setChartData([]);
            return;
        }

        if (viewMode === 'weekly') {
            const transformed = statsData.weekly_counts.map(item => ({
                date: item.week_start,
                count: item.count,
            }));
            setChartData(transformed);
        } else {
            const transformed = statsData.monthly_counts.map(item => ({
                date: item.month_start,
                count: item.count,
            }));
            setChartData(transformed);
        }
    }, [statsData, viewMode]);

    const formatXAxisTick = (value: string) => {
        const date = new Date(value);
        if (viewMode === "weekly") {
            return date.toLocaleString(undefined, { month: "short", day: "numeric" });
        }
        return date.toLocaleString(undefined, { month: "short" });
    };

    const formatTooltipLabel = (value: string) => {
        const date = new Date(value);
        if (viewMode === "weekly") {
            return `Week of ${date.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
        }
        return date.toLocaleString(undefined, { month: "short", year: "numeric" });
    };

    // Custom tooltip to avoid labelFormatter being applied to values
    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
        if (!active || !payload || payload.length === 0) return null;
        
        return (
            <div className="flex flex-col gap-0.5 rounded-lg bg-primary-solid px-3 py-2 shadow-lg">
                <p className="text-xs font-semibold text-white">{formatTooltipLabel(label || '')}</p>
                <p className="text-xs text-tooltip-supporting-text">
                    {payload[0].name}: {payload[0].value}
                </p>
            </div>
        );
    };

    return (
        <main className="flex min-w-0 flex-1 flex-col gap-8 pt-8 pb-12 overflow-y-hidden lg:overflow-y-auto">
                <div className="flex flex-col justify-between gap-4 px-4 lg:flex-row lg:px-8">
                    <p className="text-xl font-semibold text-primary lg:text-display-xs">Welcome back, {data?.name?.split(' ')[0] ?? 'User'}</p>
                </div>

                <div className="flex flex-col gap-6 px-4 lg:flex-row lg:px-8">
                    <div className="flex flex-1 flex-col rounded-xl shadow-xs ring-1 ring-secondary ring-inset">
                        <div className="flex justify-between gap-4 border-b border-secondary px-4 py-5 lg:px-6">
                            <div className="flex flex-col gap-0.5 lg:gap-0">
                                <p className="text-lg font-semibold text-primary">My project submissions</p>
                                <p className="text-sm text-tertiary">See your submissions over time</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <ButtonGroup 
                                    selectedKeys={[viewMode]}
                                    onSelectionChange={(keys) => {
                                        const selected = Array.from(keys)[0];
                                        if (selected === "weekly" || selected === "monthly") {
                                            setViewMode(selected);
                                        }
                                    }}
                                >
                                    <ButtonGroupItem id="weekly">Weekly</ButtonGroupItem>
                                    <ButtonGroupItem id="monthly">Monthly</ButtonGroupItem>
                                </ButtonGroup>
                            </div>
                        </div>
                        <div className="h-70 px-4 py-5 lg:h-63 lg:p-6">
                            {isLoading ? (
                                <div className="flex h-full items-center justify-center">
                                    <p className="text-sm text-tertiary">Loading chart data...</p>
                                </div>
                            ) : chartData.length === 0 ? (
                                <div className="flex h-full items-center justify-center">
                                    <p className="text-sm text-tertiary">No data available for this account.</p>
                                </div>
                            ) : (
                                <ResponsiveContainer>
                                    <BarChart
                                        data={chartData}
                                        margin={{
                                            left: 4,
                                            bottom: isDesktop ? 16 : 0,
                                        }}
                                        className="text-tertiary [&_.recharts-text]:text-xs"
                                    >
                                        <CartesianGrid vertical={false} stroke="currentColor" className="text-utility-gray-100" />

                                        <XAxis
                                            fill="currentColor"
                                            axisLine={false}
                                            tickLine={false}
                                            tickMargin={12}
                                            interval="preserveStartEnd"
                                            dataKey="date"
                                            tickFormatter={formatXAxisTick}
                                        >
                                            {isDesktop && <Label value={viewMode === "weekly" ? "Week" : "Month"} fill="currentColor" className="!text-xs font-medium" position="bottom" />}
                                        </XAxis>

                                        <YAxis hide={!isDesktop} fill="currentColor" axisLine={false} tickLine={false}>
                                            <Label
                                                value="Project count"
                                                fill="currentColor"
                                                className="!text-xs font-medium"
                                                style={{ textAnchor: "middle" }}
                                                angle={-90}
                                                position="insideLeft"
                                            />
                                        </YAxis>

                                        <RechartsTooltip
                                            content={<CustomTooltip />}
                                            cursor={{
                                                className: "fill-utility-gray-300/30",
                                            }}
                                        />

                                        <Bar
                                            isAnimationActive={false}
                                            className={colors["count"]}
                                            dataKey="count"
                                            name="Projects"
                                            type="monotone"
                                            fill="currentColor"
                                            maxBarSize={isDesktop ? 32 : 16}
                                            radius={[6, 6, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="mt-auto flex items-center justify-end border-t border-secondary px-4 py-3 lg:px-6 lg:py-4">
                            <Button size="md" color="secondary" href="/projects" iconLeading={Eye}>
                                View my projects
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-col rounded-xl shadow-xs ring-1 ring-secondary ring-inset lg:w-90">
                        <div className="flex justify-between gap-4 border-b border-secondary px-4 py-5 lg:px-6">
                            <div className="flex flex-col gap-0.5 lg:gap-0">
                                <p className="text-lg font-semibold text-primary">Project count</p>
                                <p className="text-sm text-tertiary">
                                    {taskStats
                                        ? `You're using ${Math.round((taskStats.active_tasks / taskStats.cap) * 100)}% of your active project cap.`
                                        : "Loading..."}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-6 p-6 lg:gap-8">
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
                                        : "Loading project data..."}
                                </p>
                            </div>
                        </div>
                        <div className="mt-auto flex items-center justify-end border-t border-secondary px-4 py-3 lg:px-6 lg:py-4">
                            <Button size="md" color="secondary" iconLeading={Zap} href="https://churchmediasquad.com/pricing" target="_blank" rel="noopener noreferrer">
                                Upgrade plan
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
    );
};

