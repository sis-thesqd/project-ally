'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getIconByName } from '@/utils/iconMapper';
import type { FC } from 'react';

interface PageItem {
    id: string;
    label: string;
    href: string;
    icon: string;
    position: number;
    created_at: string;
}

interface SidebarItem {
    label: string;
    href: string;
    icon: FC<{ className?: string }>;
}

interface SidebarPagesContextType {
    pages: PageItem[];
    sidebarItems: SidebarItem[];
    isLoading: boolean;
    error: string | null;
}

const SidebarPagesContext = createContext<SidebarPagesContextType | undefined>(undefined);

// Check cache synchronously before component mounts
function getInitialData() {
    try {
        const cached = sessionStorage.getItem('sidebar_pages');
        const cachedTimestamp = sessionStorage.getItem('sidebar_pages_timestamp');

        if (cached && cachedTimestamp) {
            const timestamp = parseInt(cachedTimestamp, 10);
            const now = Date.now();
            const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

            if (now - timestamp < CACHE_DURATION) {
                const data = JSON.parse(cached);
                if (Array.isArray(data)) {
                    console.log('Using cached sidebar pages. Age:', Math.round((now - timestamp) / 1000), 'seconds');
                    return { pages: data, isLoading: false };
                }
            } else {
                // Clear expired cache
                sessionStorage.removeItem('sidebar_pages');
                sessionStorage.removeItem('sidebar_pages_timestamp');
            }
        }
    } catch (err) {
        console.error('Failed to parse cached sidebar pages:', err);
        sessionStorage.removeItem('sidebar_pages');
        sessionStorage.removeItem('sidebar_pages_timestamp');
    }

    return { pages: [], isLoading: true };
}

export function SidebarPagesProvider({ children }: { children: React.ReactNode }) {
    const initialData = getInitialData();
    const [pages, setPages] = useState<PageItem[]>(initialData.pages);
    const [isLoading, setIsLoading] = useState(initialData.isLoading);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If we already have cached data, don't fetch
        if (pages.length > 0) {
            return;
        }

        async function fetchPages() {
            try {
                const response = await fetch('/api/pages');
                const data = await response.json();
                if (data.pages) {
                    setPages(data.pages);
                    // Cache the data with timestamp
                    const now = Date.now();
                    sessionStorage.setItem('sidebar_pages', JSON.stringify(data.pages));
                    sessionStorage.setItem('sidebar_pages_timestamp', now.toString());
                    console.log('Fetched and cached fresh sidebar pages');
                } else if (data.error) {
                    setError(data.error);
                }
            } catch (err) {
                console.error('Failed to fetch pages:', err);
                setError('Failed to fetch pages');
            } finally {
                setIsLoading(false);
            }
        }
        fetchPages();
    }, [pages.length]);

    const sidebarItems: SidebarItem[] = pages.map((page) => ({
        label: page.label,
        href: page.href,
        icon: getIconByName(page.icon),
    }));

    return (
        <SidebarPagesContext.Provider value={{ pages, sidebarItems, isLoading, error }}>
            {children}
        </SidebarPagesContext.Provider>
    );
}

export function useSidebarPages() {
    const context = useContext(SidebarPagesContext);
    if (context === undefined) {
        throw new Error('useSidebarPages must be used within a SidebarPagesProvider');
    }
    return context;
}
