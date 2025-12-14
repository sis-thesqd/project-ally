import { unstable_cache } from 'next/cache';
import { supabaseReadOnly } from '@/utils/supabase/server';

// Types imported from InitDataContext
interface PageItem {
    id: string;
    label: string;
    href: string;
    icon: string;
    position: number;
}

export interface AccountPreferences {
    default_submission_mode?: 'simple' | 'advanced';
    dont_show_mobile_qr_code_again?: boolean;
    hidden_banners?: string[];
}

interface AccountItem {
    account_number: number;
    church_name: string;
    prf_account_id: number | null;
    pa_preferences: AccountPreferences | null;
}

interface Preferences {
    default_account: number | null;
    default_theme: 'light' | 'dark' | null;
    mobile_default_theme?: 'system' | 'light' | 'dark' | null;
    mmq_split_active: boolean | null;
    default_mmq_view: 'board' | 'table' | null;
    mmq_auto_collapse_empty: boolean | null;
    mmq_table_filter: string | null;
    timezone?: string | null;
    chart_period?: 'weekly' | 'monthly' | null;
}

export type ConfigType = 'loading_message' | 'notification' | 'global_info_banner' | 'create_page_loading_message';

export interface ConfigItem {
    id: string;
    type: ConfigType;
    content: string;
    metadata: Record<string, unknown> | null;
}

export interface InitData {
    username: string | null;
    email: string;
    name: string | null;
    employee: boolean;
    profile_picture: string | null;
    clickup_id: number | null;
    preferences: Preferences;
    accounts: AccountItem[];
    pages: PageItem[];
    config: ConfigItem[];
    notifications_enabled?: boolean | null;
}

// Types for the universal data fetching pattern
export interface InitDataResult {
    data: InitData | null;
    error: string | null;
    fetchedAt: number;
}

// Raw fetch function (no caching)
async function fetchInitDataRaw(userEmail: string): Promise<InitDataResult> {
    console.log('[Init Data Fetcher] Starting fetch for email:', userEmail);
    try {
        // Don't use { get: true } to ensure fresh data from primary database
        const { data, error } = await supabaseReadOnly.rpc('pa_init_data', { input_email: userEmail });

        console.log('[Init Data Fetcher] Response:', data ? 'Data received' : 'No data', error);

        if (error) {
            throw new Error(error.message);
        }

        return {
            data: data as InitData,
            error: null,
            fetchedAt: Date.now()
        };
    } catch (error) {
        console.error('[Init Data Fetcher] Error:', error);
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            fetchedAt: Date.now()
        };
    }
}

// Cached version using Next.js unstable_cache
export const getInitData = unstable_cache(
    fetchInitDataRaw,
    ['init-data'],
    {
        revalidate: 60, // Cache for 60 seconds
        tags: ['init-data'] // Tag for on-demand revalidation
    }
);

// Force fresh fetch (bypass cache)
export async function getInitDataFresh(userEmail: string): Promise<InitDataResult> {
    return fetchInitDataRaw(userEmail);
}
