'use client';

import { usePathname } from 'next/navigation';
import { SidebarNavigationSlim } from '@/components/application/app-navigation/sidebar-navigation/sidebar-slim';
import { useInitData } from '@/contexts/InitDataContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { sidebarItems, isReady } = useInitData();

    // Don't render anything until we have data - prevents skeleton flash
    // The root layout will show a brief blank state on first load only
    if (!isReady) {
        return null;
    }

    return (
        <div className="flex flex-col bg-primary lg:flex-row h-screen overflow-hidden lg:overflow-auto">
            <SidebarNavigationSlim
                activeUrl={pathname}
                items={sidebarItems}
            />
            {children}
        </div>
    );
}
