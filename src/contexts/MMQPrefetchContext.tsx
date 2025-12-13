'use client';

import React, { createContext, useContext, useCallback, useRef } from 'react';
import { cache } from '@/utils/cache';

const PREFETCH_DEBOUNCE_MS = 300;
const CACHE_KEY_PREFIX = 'mmq-data-';

// Track ongoing prefetch requests to avoid duplicates
const ongoingPrefetches = new Set<number>();

interface MMQPrefetchContextType {
    prefetchProjectsData: (accountNumber: number) => void;
}

const MMQPrefetchContext = createContext<MMQPrefetchContextType | null>(null);

export function MMQPrefetchProvider({ children }: { children: React.ReactNode }) {
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const prefetchProjectsData = useCallback((accountNumber: number) => {
        // Clear any existing debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Debounce the prefetch call
        debounceTimerRef.current = setTimeout(() => {
            // Check if data is already cached
            const cacheKey = `${CACHE_KEY_PREFIX}${accountNumber}`;
            const cachedData = cache.get(cacheKey);

            if (cachedData) {
                // Data already cached, no need to prefetch
                return;
            }

            // Check if prefetch is already in progress
            if (ongoingPrefetches.has(accountNumber)) {
                return;
            }

            // Mark as in progress
            ongoingPrefetches.add(accountNumber);

            // Use requestIdleCallback to prefetch during idle time
            // Falls back to setTimeout if requestIdleCallback is not available
            const scheduleWork = typeof window !== 'undefined' && 'requestIdleCallback' in window
                ? window.requestIdleCallback
                : (callback: IdleRequestCallback) => setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 } as IdleDeadline), 1);

            scheduleWork(async () => {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_MMQ_API_URL || '';
                    const response = await fetch(`${apiUrl}/api/mmq/queue-data?accountNumber=${accountNumber}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();

                        // Cache the prefetched data
                        cache.set(cacheKey, data);

                        console.log(`[MMQ Prefetch] ✓ Prefetched data for account ${accountNumber}`);
                    }
                } catch (error) {
                    // Silently fail - this is a background prefetch
                    console.warn(`[MMQ Prefetch] ✗ Failed to prefetch data for account ${accountNumber}:`, error);
                } finally {
                    // Mark as complete
                    ongoingPrefetches.delete(accountNumber);
                }
            });
        }, PREFETCH_DEBOUNCE_MS);
    }, []);

    return (
        <MMQPrefetchContext.Provider value={{ prefetchProjectsData }}>
            {children}
        </MMQPrefetchContext.Provider>
    );
}

export function useMMQPrefetch() {
    const context = useContext(MMQPrefetchContext);
    if (!context) {
        throw new Error('useMMQPrefetch must be used within MMQPrefetchProvider');
    }
    return context;
}
