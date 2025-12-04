"use client";

import { useEffect, useMemo, useState } from "react";
import {
    ArrowDown,
    ArrowUp,
    DownloadCloud02,
    Edit01,
    FilterLines,
    Plus,
    SearchLg,
    Settings03,
    Trash01,
    UploadCloud02,
    Zap,
    Eye,
} from "@untitledui/icons";
import type { SortDescriptor } from "react-aria-components";
import { Bar, BarChart, CartesianGrid, Label, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { MetricChangeIndicator } from "@/components/application/metrics/metrics";
import { PaginationCardMinimal } from "@/components/application/pagination/pagination";
import { Table, TableCard, TableRowActionsDropdown } from "@/components/application/table/table";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge, BadgeWithDot, BadgeWithIcon } from "@/components/base/badges/badges";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { ProgressBarHalfCircle } from "@/components/base/progress-indicators/progress-circles";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { useInitData } from "@/contexts/InitDataContext";

// Helper functions for formatting
const formatDate = (timestamp: number): string =>
    new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

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

const movements = [
    {
        id: "vendor-01",
        vendor: {
            name: "Ephemeral",
            website: "ephemeral.io",
            logoUrl: "https://www.untitledui.com/logos/images/Ephemeral.jpg",
        },
        rating: 60,
        change: "5%",
        changeTrend: "positive",
        lastAssessed: new Date(2025, 0, 22).getTime(),
        categories: ["Active", "Customer data", "Admin", "+4"],
    },
    {
        id: "vendor-02",
        vendor: {
            name: "Stack3d Lab",
            website: "stack3dlab.com",
            logoUrl: "https://www.untitledui.com/logos/images/Stack3d Lab.jpg",
        },
        rating: 72,
        change: "4%",
        changeTrend: "negative",
        lastAssessed: new Date(2025, 0, 20).getTime(),
        categories: ["Active", "Business data", "Admin", "+4"],
    },
    {
        id: "vendor-03",
        vendor: {
            name: "WarpSpeed",
            website: "getwarpspeed.com",
            logoUrl: "https://www.untitledui.com/logos/images/Warpspeed.jpg",
        },
        rating: 78,
        change: "6%",
        changeTrend: "positive",
        lastAssessed: new Date(2025, 0, 24).getTime(),
        categories: ["Active", "Customer data", "Financials"],
    },
    {
        id: "vendor-04",
        vendor: {
            name: "CloudWatch",
            website: "cloudwatch.app",
            logoUrl: "https://www.untitledui.com/logos/images/CloudWatch.jpg",
        },
        rating: 38,
        change: "8%",
        changeTrend: "positive",
        lastAssessed: new Date(2025, 0, 26).getTime(),
        categories: ["Active", "Database access", "Admin"],
    },
    {
        id: "vendor-05",
        vendor: {
            name: "ContrastAI",
            website: "contrastai.com",
            logoUrl: "https://www.untitledui.com/logos/images/ContrastAI.jpg",
        },
        rating: 42,
        change: "1%",
        changeTrend: "negative",
        lastAssessed: new Date(2025, 0, 18).getTime(),
        categories: ["Active", "Salesforce", "Admin", "+4"],
    },
    {
        id: "vendor-06",
        vendor: {
            name: "Convergence",
            website: "convergence.io",
            logoUrl: "https://www.untitledui.com/logos/images/Convergence.jpg",
        },
        rating: 66,
        change: "6%",
        changeTrend: "negative",
        lastAssessed: new Date(2025, 0, 28).getTime(),
        categories: ["Active", "Business data", "Admin", "+4"],
    },
    {
        id: "vendor-07",
        vendor: {
            name: "Sisyphus",
            website: "sisyphus.com",
            logoUrl: "https://www.untitledui.com/logos/images/Sisyphus.jpg",
        },
        rating: 91,
        change: "2%",
        changeTrend: "positive",
        lastAssessed: new Date(2025, 0, 16).getTime(),
        categories: ["Inactive", "Customer data", "Financials"],
    },
];

const colors: Record<string, string> = {
    count: "text-utility-brand-600",
};

type ViewMode = "weekly" | "monthly";

export const Dashboard = () => {
    const isDesktop = useBreakpoint("lg");
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();
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

    const sortedItems = useMemo(() => {
        if (!sortDescriptor) return movements;

        return movements.toSorted((a, b) => {
            let first = a[sortDescriptor.column as keyof typeof a];
            let second = b[sortDescriptor.column as keyof typeof b];

            // Extract name from objects if needed
            if (typeof first === "object" && first && "name" in first) {
                first = first.name;
            }
            if (typeof second === "object" && second && "name" in second) {
                second = second.name;
            }

            // Handle numbers
            if (typeof first === "number" && typeof second === "number") {
                return sortDescriptor.direction === "ascending" ? first - second : second - first;
            }

            // Handle strings
            if (typeof first === "string" && typeof second === "string") {
                const result = first.localeCompare(second);
                return sortDescriptor.direction === "ascending" ? result : -result;
            }

            return 0;
        });
    }, [sortDescriptor]);

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
                    <div className="flex gap-3">
                        <Button size="md" color="tertiary" iconLeading={SearchLg} className="hidden lg:inline-flex" />
                        <Button size="md" color="secondary" iconLeading={Settings03}>
                            Customize
                        </Button>
                        <Button size="md" color="secondary" iconLeading={DownloadCloud02}>
                            Export
                        </Button>
                    </div>
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
                            <Button size="md" color="secondary" iconLeading={Zap}>
                                Upgrade plan
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col px-4 lg:px-8">
                    <TableCard.Root className="-mx-4 rounded-none ring-0 lg:mx-0 lg:rounded-xl lg:ring-1">
                        <TableCard.Header
                            title="Vendor movements"
                            description="Keep track of vendor and their security ratings."
                            contentTrailing={
                                <div className="flex gap-3">
                                    <Button size="md" color="secondary" iconLeading={UploadCloud02}>
                                        Import
                                    </Button>
                                    <Button size="md" iconLeading={Plus}>
                                        Add vendor
                                    </Button>

                                    <div className="absolute top-0 right-4 lg:hidden">
                                        <TableRowActionsDropdown />
                                    </div>
                                </div>
                            }
                            badge={
                                <Badge size="sm" type="modern" className="hidden lg:inline-flex">
                                    240 vendors
                                </Badge>
                            }
                            className="border-b-0 py-0 lg:border-b lg:py-5"
                        />

                        <div className="flex flex-col justify-between gap-4 border-b border-secondary px-4 py-6 lg:flex-row lg:px-6 lg:py-3">
                            <ButtonGroup defaultSelectedKeys={["all"]}>
                                <ButtonGroupItem id="all">View all</ButtonGroupItem>
                                <ButtonGroupItem id="monitored">Monitored</ButtonGroupItem>
                                <ButtonGroupItem id="unmonitored">Unmonitored</ButtonGroupItem>
                            </ButtonGroup>
                            <div className="order-first flex gap-3 lg:order-none">
                                <Input icon={SearchLg} shortcut aria-label="Search" placeholder="Search" size="sm" className="lg:w-74" />
                                <Button size="md" color="secondary" iconLeading={FilterLines} className="hidden lg:inline-flex">
                                    Filters
                                </Button>
                                <Button size="md" color="secondary" iconLeading={FilterLines} className="inline-flex lg:hidden" />
                            </div>
                        </div>

                        <Table
                            aria-label="Trades"
                            selectionMode="multiple"
                            defaultSelectedKeys={["vendor-01", "vendor-02", "vendor-03", "vendor-06", "vendor-07"]}
                            sortDescriptor={sortDescriptor}
                            onSortChange={setSortDescriptor}
                        >
                            <Table.Header>
                                <Table.Head id="vendor" isRowHeader allowsSorting label="Vendor" className="w-full" />
                                <Table.Head id="rating" label="Rating" className="min-w-35 lg:min-w-[345px]" />
                                <Table.Head id="change" />
                                <Table.Head id="lastAssessed" label="Last assessed" />
                                <Table.Head id="categories" label="Categories" />
                                <Table.Head id="actions" />
                            </Table.Header>
                            <Table.Body items={sortedItems}>
                                {(movement) => (
                                    <Table.Row id={movement.id} highlightSelectedRow={false}>
                                        <Table.Cell className="lg:px-0">
                                            <div className="group flex items-center gap-3">
                                                <Avatar src={movement.vendor.logoUrl} alt={movement.vendor.name} size="md" />
                                                <div>
                                                    <p className="text-sm font-medium text-primary">{movement.vendor.name}</p>
                                                    <p className="text-sm text-tertiary">{movement.vendor.website}</p>
                                                </div>
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div className="flex items-center gap-3">
                                                <ProgressBar min={0} max={100} value={movement.rating} />
                                                <span className="hidden text-sm font-medium text-secondary lg:inline">{movement.rating}</span>
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <BadgeWithIcon
                                                iconLeading={movement.changeTrend === "positive" ? ArrowUp : ArrowDown}
                                                size="sm"
                                                type="modern"
                                                color={movement.changeTrend === "positive" ? "success" : "error"}
                                            >
                                                {movement.change}
                                            </BadgeWithIcon>
                                        </Table.Cell>
                                        <Table.Cell className="text-nowrap">{formatDate(movement.lastAssessed)}</Table.Cell>
                                        <Table.Cell>
                                            <div className="flex gap-1">
                                                {movement.categories.map((category) =>
                                                    category === "Active" || category === "Inactive" ? (
                                                        <BadgeWithDot
                                                            key={category}
                                                            size="sm"
                                                            type="modern"
                                                            color={category === "Active" ? "success" : "gray"}
                                                            className="capitalize"
                                                        >
                                                            {category}
                                                        </BadgeWithDot>
                                                    ) : (
                                                        <Badge key={category} size="sm" type="modern" color="gray">
                                                            {category}
                                                        </Badge>
                                                    ),
                                                )}
                                            </div>
                                        </Table.Cell>

                                        <Table.Cell className="px-4">
                                            <div className="flex justify-end gap-0.5">
                                                <ButtonUtility size="xs" color="tertiary" tooltip="Delete" icon={Trash01} />
                                                <ButtonUtility size="xs" color="tertiary" tooltip="Edit" icon={Edit01} />
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table>
                        <PaginationCardMinimal page={1} total={10} align="right" />
                    </TableCard.Root>
                </div>
            </main>
    );
};

