'use client';

import { usePathname } from 'next/navigation';
import { SidebarNavigationSlim } from '@/components/application/app-navigation/sidebar-navigation/sidebar-slim';
import { useSidebarPages } from '@/contexts/SidebarPagesContext';

function SidebarSkeleton() {
    const MAIN_SIDEBAR_WIDTH = 68;

    return (
        <>
            {/* Desktop skeleton */}
            <div className="z-50 hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex">
                <aside
                    style={{ width: MAIN_SIDEBAR_WIDTH }}
                    className="group flex h-full max-h-full max-w-full overflow-y-auto py-1 pl-1"
                >
                    <div className="flex w-auto flex-col justify-between rounded-xl bg-primary pt-5 ring-1 ring-secondary ring-inset">
                        {/* Logo - no skeleton */}
                        <div className="flex justify-center px-3">
                            <img
                                src="/logos/Badge Slanted_Blue-01.svg"
                                alt="Logo"
                                className="h-8"
                            />
                        </div>

                        {/* Single nav item skeleton */}
                        <ul className="mt-4 flex flex-col gap-0.5 px-3">
                            <li>
                                <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
                            </li>
                        </ul>

                        {/* Avatar skeleton */}
                        <div className="mt-auto flex flex-col gap-4 px-3 py-5">
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        </div>
                    </div>
                </aside>
            </div>

            {/* Placeholder to take up physical space */}
            <div
                style={{ paddingLeft: MAIN_SIDEBAR_WIDTH }}
                className="invisible hidden lg:sticky lg:top-0 lg:bottom-0 lg:left-0 lg:block"
            />

            {/* Mobile skeleton */}
            <div className="lg:hidden w-full border-b border-secondary">
                <div className="h-16 px-4 flex items-center">
                    <div className="h-8 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </div>
            </div>
        </>
    );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { sidebarItems, isLoading: isLoadingPages } = useSidebarPages();

    return (
        <div className="flex flex-col bg-primary lg:flex-row h-screen overflow-hidden lg:overflow-auto">
            {isLoadingPages || sidebarItems.length === 0 ? (
                <SidebarSkeleton />
            ) : (
                <SidebarNavigationSlim
                    activeUrl={pathname}
                    items={sidebarItems}
                />
            )}
            {children}
        </div>
    );
}
