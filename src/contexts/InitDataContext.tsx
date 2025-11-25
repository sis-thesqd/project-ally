'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getIconByName } from '@/utils/iconMapper';
import type { FC } from 'react';

interface PageItem {
    id: string;
    label: string;
    href: string;
    icon: string;
    position: number;
}

interface AccountItem {
    account_number: number;
    church_name: string;
}

interface Preferences {
    default_account: number | null;
    default_theme: 'light' | 'dark' | null;
    mmq_split_active: boolean | null;
    default_mmq_view: 'board' | 'table' | null;
}

interface SidebarItem {
    label: string;
    href: string;
    icon: FC<{ className?: string }>;
}

interface InitData {
    username: string | null;
    email: string;
    name: string | null;
    employee: boolean;
    profile_picture: string | null;
    preferences: Preferences;
    accounts: AccountItem[];
    pages: PageItem[];
}

interface InitDataContextType {
    data: InitData | null;
    sidebarItems: SidebarItem[];
    isReady: boolean;
    updatePreferences: (preferences: Partial<Preferences>) => Promise<void>;
}

const CACHE_KEY = 'pa_init_data';
const CACHE_TIMESTAMP_KEY = 'pa_init_data_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const InitDataContext = createContext<InitDataContextType>({
    data: null,
    sidebarItems: [],
    isReady: false,
    updatePreferences: async () => {},
});

// Module-level state to persist across navigations
let moduleData: InitData | null = null;
let moduleIsReady = false;
let fetchPromise: Promise<void> | null = null;

function getFromSessionStorage(): InitData | null {
    if (typeof window === 'undefined') return null;

    try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);

        if (cached && timestamp) {
            const age = Date.now() - parseInt(timestamp, 10);
            if (age < CACHE_DURATION) {
                console.log('Using cached init data. Age:', Math.round(age / 1000), 'seconds');
                return JSON.parse(cached);
            }
            // Expired - clear it
            sessionStorage.removeItem(CACHE_KEY);
            sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
        }
    } catch (e) {
        console.error('Error reading from sessionStorage:', e);
    }
    return null;
}

function saveToSessionStorage(data: InitData): void {
    if (typeof window === 'undefined') return;

    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
        sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
        console.error('Error saving to sessionStorage:', e);
    }
}

async function fetchInitData(): Promise<InitData | null> {
    // Don't fetch on login or auth pages
    if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        if (pathname === '/login' || pathname.startsWith('/auth')) {
            return null;
        }
    }

    try {
        const response = await fetch('/api/init');
        if (response.status === 401) {
            // User not authenticated - redirect to login
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            return null;
        }
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        return data;
    } catch (e) {
        console.error('Error fetching init data:', e);
        return null;
    }
}

export function InitDataProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<InitData | null>(moduleData);
    const [isReady, setIsReady] = useState(moduleIsReady);
    const initialized = useRef(false);

    useEffect(() => {
        // Already have data from module cache
        if (moduleIsReady && moduleData) {
            setData(moduleData);
            setIsReady(true);
            return;
        }

        // Prevent double initialization
        if (initialized.current) return;
        initialized.current = true;

        // Check sessionStorage first
        const cached = getFromSessionStorage();
        if (cached) {
            moduleData = cached;
            moduleIsReady = true;
            setData(cached);
            setIsReady(true);
            return;
        }

        // If already fetching, wait for that promise
        if (fetchPromise) {
            fetchPromise.then(() => {
                if (moduleData) {
                    setData(moduleData);
                    setIsReady(true);
                }
            });
            return;
        }

        // Fetch fresh data
        fetchPromise = fetchInitData().then((result) => {
            if (result) {
                moduleData = result;
                moduleIsReady = true;
                saveToSessionStorage(result);
                setData(result);
                console.log('Fetched and cached fresh init data');
            }
            setIsReady(true);
            fetchPromise = null;
        });
    }, []);

    const sidebarItems: SidebarItem[] = (data?.pages ?? []).map((page) => ({
        label: page.label,
        href: page.href,
        icon: getIconByName(page.icon),
    }));

    const updatePreferences = async (preferences: Partial<Preferences>) => {
        if (!data) return;

        try {
            const response = await fetch('/api/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preferences),
            });

            if (!response.ok) {
                throw new Error('Failed to update preferences');
            }

            // Update local state and cache
            const updatedData: InitData = {
                ...data,
                preferences: {
                    ...data.preferences,
                    ...preferences,
                },
            };

            moduleData = updatedData;
            setData(updatedData);
            saveToSessionStorage(updatedData);
        } catch (e) {
            console.error('Error updating preferences:', e);
        }
    };

    return (
        <InitDataContext.Provider value={{ data, sidebarItems, isReady, updatePreferences }}>
            {children}
        </InitDataContext.Provider>
    );
}

export function useInitData() {
    return useContext(InitDataContext);
}
