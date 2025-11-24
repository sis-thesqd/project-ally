"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
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
} from "@untitledui/icons";
import { useSidebarPages } from "@/contexts/SidebarPagesContext";
import type { SortDescriptor } from "react-aria-components";
import { Bar, BarChart, CartesianGrid, Label, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { SidebarNavigationSlim } from "@/components/application/app-navigation/sidebar-navigation/sidebar-slim";
import { ChartTooltipContent } from "@/components/application/charts/charts-base";
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

// Helper functions for formatting
const formatDate = (timestamp: number): string =>
    new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

const barData = [
    {
        date: "2025-01-01",
        A: 30,
        B: 20,
        C: 35,
    },
    {
        date: "2025-02-01",
        A: 32,
        B: 30,
        C: 30,
    },
    {
        date: "2025-03-01",
        A: 30,
        B: 20,
        C: 24,
    },
    {
        date: "2025-04-01",
        A: 24,
        B: 30,
        C: 28,
    },
    {
        date: "2025-05-01",
        A: 32,
        B: 28,
        C: 10,
    },
    {
        date: "2025-06-01",
        A: 33,
        B: 30,
        C: 13,
    },
    {
        date: "2025-07-01",
        A: 30,
        B: 20,
        C: 10,
    },
    {
        date: "2025-08-01",
        A: 35,
        B: 30,
        C: 20,
    },
    {
        date: "2025-09-01",
        A: 30,
        B: 20,
        C: 10,
    },
    {
        date: "2025-10-01",
        A: 20,
        B: 30,
        C: 28,
    },
    {
        date: "2025-11-01",
        A: 24,
        B: 30,
        C: 30,
    },
    {
        date: "2025-12-01",
        A: 20,
        B: 40,
        C: 35,
    },
];

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
    A: "text-utility-brand-700",
    B: "text-utility-brand-500",
    C: "text-utility-gray-200",
};

export const Dashboard09 = () => {
    const pathname = usePathname();
    const isDesktop = useBreakpoint("lg");
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();
    const { sidebarItems, isLoading: isLoadingPages } = useSidebarPages();

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

    if (isLoadingPages || sidebarItems.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-primary lg:flex-row">
            <SidebarNavigationSlim
                activeUrl={pathname}
                items={sidebarItems}
            />
            <main className="flex min-w-0 flex-1 flex-col gap-8 pt-8 pb-12">
                <div className="flex flex-col justify-between gap-4 px-4 lg:flex-row lg:px-8">
                    <p className="text-xl font-semibold text-primary lg:text-display-xs">Welcome back, Olivia</p>
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
                            <div className="flex gap-3">
                                <Avatar src="https://www.untitledui.com/logos/images/Lightbox.jpg" alt="Lightbox" size="xl" className="max-lg:hidden" />
                                <div className="flex flex-col gap-0.5 lg:gap-0">
                                    <p className="text-lg font-semibold text-primary">Vendor breakdown</p>
                                    <p className="text-sm text-tertiary">Keep track of vendors and their security ratings.</p>
                                </div>
                            </div>
                            <div>
                                <TableRowActionsDropdown />
                            </div>
                        </div>
                        <div className="h-70 px-4 py-5 lg:h-63 lg:p-6">
                            <ResponsiveContainer>
                                <BarChart
                                    data={barData}
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
                                        tickFormatter={(value) => new Date(value).toLocaleString(undefined, { month: "short" })}
                                    >
                                        {isDesktop && <Label value="Month" fill="currentColor" className="!text-xs font-medium" position="bottom" />}
                                    </XAxis>

                                    <YAxis hide={!isDesktop} domain={[0, 100]} fill="currentColor" axisLine={false} tickLine={false}>
                                        <Label
                                            value="Security rating"
                                            fill="currentColor"
                                            className="!text-xs font-medium"
                                            style={{ textAnchor: "middle" }}
                                            angle={-90}
                                            position="insideLeft"
                                        />
                                    </YAxis>

                                    <RechartsTooltip
                                        content={<ChartTooltipContent />}
                                        labelFormatter={(value) => new Date(value).toLocaleString(undefined, { month: "short", year: "numeric" })}
                                        cursor={{
                                            className: "fill-utility-gray-300/30",
                                        }}
                                    />

                                    <Bar
                                        isAnimationActive={false}
                                        className={colors["A"]}
                                        dataKey="A"
                                        name="EU"
                                        type="monotone"
                                        stackId="a"
                                        fill="currentColor"
                                        maxBarSize={isDesktop ? 32 : 16}
                                    />
                                    <Bar
                                        isAnimationActive={false}
                                        className={colors["B"]}
                                        dataKey="B"
                                        name="US"
                                        type="monotone"
                                        stackId="a"
                                        fill="currentColor"
                                        maxBarSize={isDesktop ? 32 : 16}
                                    />
                                    <Bar
                                        isAnimationActive={false}
                                        className={colors["C"]}
                                        dataKey="C"
                                        name="Asia"
                                        type="monotone"
                                        stackId="a"
                                        fill="currentColor"
                                        maxBarSize={isDesktop ? 32 : 16}
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-end border-t border-secondary px-4 py-3 lg:px-6 lg:py-4">
                            <Button size="md" color="secondary">
                                View full report
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-col rounded-xl shadow-xs ring-1 ring-secondary ring-inset lg:w-90">
                        <div className="flex justify-between gap-4 border-b border-secondary px-4 py-5 lg:px-6">
                            <div className="flex flex-col gap-0.5">
                                <p className="text-lg font-semibold text-primary">Vendors monitored</p>
                                <p className="text-sm text-tertiary">You're using 80% of available spots.</p>
                            </div>
                            <div>
                                <TableRowActionsDropdown />
                            </div>
                        </div>
                        <div className="flex flex-col gap-6 p-6 lg:gap-8">
                            <div className="flex items-start justify-between">
                                <ProgressBarHalfCircle size="sm" min={0} max={300} value={240} valueFormatter={(value) => value} />
                                <MetricChangeIndicator type="trend" trend="positive" value="10%" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-md font-medium text-primary">You've almost reached your limit</p>
                                <p className="text-sm text-tertiary">You have used 80% of your available spots. Upgrade plan to monitor more vendors.</p>
                            </div>
                        </div>
                        <div className="flex justify-end border-t border-secondary px-4 py-3 lg:px-6 lg:py-4">
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
        </div>
    );
};
