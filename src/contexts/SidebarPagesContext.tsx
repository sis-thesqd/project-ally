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

export function SidebarPagesProvider({ children }: { children: React.ReactNode }) {
    const [pages, setPages] = useState<PageItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if data is already cached
        const cached = sessionStorage.getItem('sidebar_pages');
        if (cached) {
            try {
                const cachedData = JSON.parse(cached);
                setPages(cachedData);
                setIsLoading(false);
                return;
            } catch (err) {
                console.error('Failed to parse cached pages:', err);
            }
        }

        async function fetchPages() {
            try {
                const response = await fetch('/api/pages');
                const data = await response.json();
                if (data.pages) {
                    setPages(data.pages);
                    // Cache the data
                    sessionStorage.setItem('sidebar_pages', JSON.stringify(data.pages));
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
    }, []);

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
