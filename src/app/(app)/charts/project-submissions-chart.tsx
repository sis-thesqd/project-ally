"use client";

import { useEffect, useState } from "react";
import { Eye } from "@untitledui/icons";
import { Bar, BarChart, CartesianGrid, Label, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Button } from "@/components/base/buttons/button";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { cache } from "@/utils/cache";
import { ChartTooltip } from "./chart-tooltip";
import { BarChartSkeleton } from "./bar-chart-skeleton";

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

const colors: Record<string, string> = {
    count: "text-utility-brand-600",
};

type ViewMode = "weekly" | "monthly";

interface ProjectSubmissionsChartProps {
    selectedAccount: number | null | undefined;
    chartPeriod?: 'weekly' | 'monthly' | null;
}

export const ProjectSubmissionsChart = ({ selectedAccount, chartPeriod }: ProjectSubmissionsChartProps) => {
    const isDesktop = useBreakpoint("lg");
    const [viewMode, setViewMode] = useState<ViewMode>(chartPeriod || "monthly");
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statsData, setStatsData] = useState<AccountStatsResponse | null>(null);

    // Update view mode when chartPeriod changes
    useEffect(() => {
        if (chartPeriod) {
            setViewMode(chartPeriod);
        }
    }, [chartPeriod]);

    // Fetch chart data when account changes
    useEffect(() => {
        if (!selectedAccount) return;

        const cacheKey = `account-stats-${selectedAccount}`;
        const cachedData = cache.get<AccountStatsResponse>(cacheKey);
        
        if (cachedData) {
            setStatsData(cachedData);
            setIsLoading(false);
            return;
        }

        const fetchChartData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/account-stats?account=${selectedAccount}`);
                if (!response.ok) throw new Error('Failed to fetch');
                const rawData: AccountStatsResponse = await response.json();
                setStatsData(rawData);
                cache.set(cacheKey, rawData);
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

    return (
        <div className="flex flex-1 flex-col rounded-xl shadow-xs ring-1 ring-secondary ring-inset">
            <div className="flex flex-col gap-3 border-b border-secondary px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-5 lg:px-6">
                <div className="flex flex-col gap-0.5 lg:gap-0">
                    <p className="text-lg font-semibold text-primary">My project submissions</p>
                    <p className="text-sm text-tertiary">See your submissions over time</p>
                </div>
                <ButtonGroup
                    className="w-full lg:w-auto"
                    selectedKeys={[viewMode]}
                    onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0];
                        if (selected === "weekly" || selected === "monthly") {
                            setViewMode(selected);
                        }
                    }}
                >
                    <ButtonGroupItem id="weekly" className="flex-1 justify-center lg:flex-none">Weekly</ButtonGroupItem>
                    <ButtonGroupItem id="monthly" className="flex-1 justify-center lg:flex-none">Monthly</ButtonGroupItem>
                </ButtonGroup>
            </div>
            <div className="h-52 px-4 py-5 lg:h-52 lg:p-6">
                {isLoading ? (
                    <BarChartSkeleton />
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
                                content={<ChartTooltip formatLabel={formatTooltipLabel} />}
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
                                maxBarSize={isDesktop ? 72 : 40}
                                barSize={isDesktop ? 64 : 36}
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
    );
};

