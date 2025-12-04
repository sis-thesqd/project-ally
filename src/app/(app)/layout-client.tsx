'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { SidebarNavigationSlim } from '@/components/application/app-navigation/sidebar-navigation/sidebar-slim';
import { useInitData } from '@/contexts/InitDataContext';

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data, sidebarItems, isReady, updatePreferences } = useInitData();
    const { setTheme } = useTheme();
    const preferencesInitialized = useRef(false);
    const [mounted, setMounted] = useState(false);

    // Wait for next-themes to mount
    useEffect(() => {
        setMounted(true);
    }, []);

    // Apply user's preferred theme from preferences on first load
    // Or create default preferences if none exist
    useEffect(() => {
        if (!mounted || !isReady || !data || preferencesInitialized.current) return;

        const hasPreferences = data.preferences?.default_theme !== null || data.preferences?.default_account !== null;

        if (hasPreferences) {
            // Apply existing preferences
            if (data.preferences.default_theme) {
                setTheme(data.preferences.default_theme);
            }
        } else {
            // No preferences exist - create defaults
            const defaultAccount = data.accounts[0]?.account_number;
            const defaultTheme = 'light' as const;

            // Set the theme locally
            setTheme(defaultTheme);

            // Save defaults to database
            updatePreferences({
                default_account: defaultAccount,
                default_theme: defaultTheme,
            });
        }

        preferencesInitialized.current = true;
    }, [mounted, isReady, data, setTheme, updatePreferences]);

    // Don't render anything until we have data - prevents skeleton flash
    if (!isReady) {
        return null;
    }

    return (
        <div className="flex flex-col bg-primary lg:flex-row h-screen overflow-hidden lg:overflow-y-scroll lg:scrollbar-auto">
            <SidebarNavigationSlim
                activeUrl={pathname}
                items={sidebarItems}
            />
            {children}
        </div>
    );
}
