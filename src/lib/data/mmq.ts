import { unstable_cache } from 'next/cache';
import type { TaskResponse } from '@sis-thesqd/mmq-component';

const MMQ_API_URL = process.env.NEXT_PUBLIC_MMQ_API_URL || 'https://api-thesqd.vercel.app';

// Types for the universal data fetching pattern
export interface MMQDataResult {
    data: TaskResponse | null;
    error: string | null;
    fetchedAt: number;
}

// Raw fetch function (no caching)
async function fetchMMQDataRaw(accountNumber: number): Promise<MMQDataResult> {
    console.log('[MMQ Fetcher] Starting fetch for account:', accountNumber, 'URL:', MMQ_API_URL);
    try {
        const response = await fetch(
            `${MMQ_API_URL}/api/mmq/queue-data?account=${accountNumber}`,
            {
                headers: { 'Content-Type': 'application/json' },
                next: { revalidate: 60 } // ISR: revalidate every 60 seconds
            }
        );

        console.log('[MMQ Fetcher] Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log('[MMQ Fetcher] Data received, tasks:', result.data?.tasks?.length || 0);
        return {
            data: result.data,
            error: null,
            fetchedAt: Date.now()
        };
    } catch (error) {
        console.error('[MMQ Fetcher] Error:', error);
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            fetchedAt: Date.now()
        };
    }
}

// Cached version using Next.js unstable_cache
export const getMMQData = unstable_cache(
    fetchMMQDataRaw,
    ['mmq-data'],
    {
        revalidate: 60, // Cache for 60 seconds
        tags: ['mmq'] // Tag for on-demand revalidation
    }
);

// Force fresh fetch (bypass cache)
export async function getMMQDataFresh(accountNumber: number): Promise<MMQDataResult> {
    return fetchMMQDataRaw(accountNumber);
}
