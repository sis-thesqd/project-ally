'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { SidebarNavigationSlim } from '@/components/application/app-navigation/sidebar-navigation/sidebar-slim';
import { GlobalInfoBanner } from '@/components/application/banners/global-info-banner';
import { useInitData } from '@/contexts/InitDataContext';
import { CreateProvider } from './create/CreateContext';

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
        <CreateProvider>
            <div className="flex flex-col h-screen">
                {/* Desktop: Banner outside scroll area (sticky at top) */}
                <div className="hidden lg:block">
                    <GlobalInfoBanner />
                </div>
                <div className="flex flex-col bg-primary lg:flex-row flex-1 min-h-0 overflow-y-auto lg:overflow-y-scroll lg:scrollbar-auto pt-16 lg:pt-0">
                    {/* Mobile: Banner inside scroll area (scrolls with content) */}
                    <div className="lg:hidden">
                        <GlobalInfoBanner />
                    </div>
                    <SidebarNavigationSlim
                        activeUrl={pathname}
                        items={sidebarItems}
                    />
                    {children}
                </div>
            </div>
        </CreateProvider>
    );
}
