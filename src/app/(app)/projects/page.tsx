'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MMQ, MMQSkeleton } from '@sis-thesqd/mmq-component';
import { Button } from '@/components/base/buttons/button';
import { SearchLg } from '@untitledui/icons';
import { useInitData } from '@/contexts/InitDataContext';

interface ProjectsContentProps {
    accountNumber: number;
    onAccountChange: (account: number) => void;
}

function ProjectsContent({ accountNumber, onAccountChange }: ProjectsContentProps) {
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [cachedData, setCachedData] = useState<any>(null);
    const [shouldFetch, setShouldFetch] = useState(true);
    const [cacheTimestamp, setCacheTimestamp] = useState<number | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_MMQ_API_URL || '';
    const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds
    const CACHE_KEY = `mmq_cache_${accountNumber}`;
    const CACHE_TIMESTAMP_KEY = `mmq_cache_timestamp_${accountNumber}`;

    useEffect(() => {
        // Check for cached data on mount
        const cached = sessionStorage.getItem(CACHE_KEY);
        const cachedTimestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);

        if (cached && cachedTimestamp) {
            try {
                const data = JSON.parse(cached);
                const timestamp = parseInt(cachedTimestamp, 10);
                const now = Date.now();

                // Validate data structure has required properties
                if (data && typeof data === 'object' && Array.isArray(data.tasks) && now - timestamp < CACHE_DURATION) {
                    setCachedData(data);
                    setCacheTimestamp(timestamp);
                    setShouldFetch(false);
                    console.log('Using cached data for account', accountNumber, 'Age:', Math.round((now - timestamp) / 1000), 'seconds', 'Tasks:', data.tasks.length);
                } else {
                    sessionStorage.removeItem(CACHE_KEY);
                    sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
                    setShouldFetch(true);
                    console.log('Cache invalid or expired for account', accountNumber);
                }
            } catch (error) {
                console.error('Error parsing cached data:', error);
                sessionStorage.removeItem(CACHE_KEY);
                sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
                setShouldFetch(true);
            }
        } else {
            setShouldFetch(true);
        }
        setIsInitialLoad(false);
    }, [accountNumber, CACHE_KEY, CACHE_TIMESTAMP_KEY, CACHE_DURATION]);

    const handleDataLoaded = (data: any) => {
        const now = Date.now();
        console.log('Fresh data loaded for account', accountNumber, 'Tasks:', data?.tasks?.length || 0);

        // Only cache if data has valid structure
        if (data && typeof data === 'object' && Array.isArray(data.tasks)) {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
            sessionStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());
            setCacheTimestamp(now);
        } else {
            console.warn('Invalid data structure, not caching');
        }
    };

    if (isInitialLoad) {
        return <MMQSkeleton />;
    }

    // If we have valid cached data, show it without fetching
    if (!shouldFetch && cachedData) {
        return (
            <div>
                <MMQ
                    accountNumber={accountNumber}
                    supabaseUrl=""
                    supabaseKey=""
                    dataEndpoint={`${apiUrl}/api/queue-data`}
                    reorderEndpoint={`${apiUrl}/api/reorder`}
                    playPauseEndpoint={`${apiUrl}/api/play-pause`}
                    showAccountOverride={false}
                    showCountdownTimers={true}
                    showTitle={false}
                    initialData={cachedData}
                    onError={(error) => console.error('MMQ Error:', error)}
                    onDataLoaded={handleDataLoaded}
                    onChangesApplied={() => console.log('Changes applied')}
                />
            </div>
        );
    }

    return (
        <MMQ
            accountNumber={accountNumber}
            supabaseUrl=""
            supabaseKey=""
            dataEndpoint={`${apiUrl}/api/queue-data`}
            reorderEndpoint={`${apiUrl}/api/reorder`}
            playPauseEndpoint={`${apiUrl}/api/play-pause`}
            showAccountOverride={false}
            showCountdownTimers={true}
            showTitle={false}
            initialData={cachedData}
            onError={(error) => console.error('MMQ Error:', error)}
            onDataLoaded={handleDataLoaded}
            onChangesApplied={() => console.log('Changes applied')}
        />
    );
}

export default function ProjectsPage() {
    const searchParams = useSearchParams();
    const { data } = useInitData();
    const urlAccountNumber = searchParams.get('accountNumber');

    // Priority: URL param > user preference > first account > fallback
    const defaultAccount = urlAccountNumber
        ? parseInt(urlAccountNumber, 10)
        : data?.preferences?.default_account ?? data?.accounts?.[0]?.account_number ?? 306;

    const [accountNumber, setAccountNumber] = useState<number | null>(null);
    const [showAccountInput, setShowAccountInput] = useState(false);
    const [accountInput, setAccountInput] = useState('');

    // Update account number when data loads or URL changes
    useEffect(() => {
        if (urlAccountNumber) {
            setAccountNumber(parseInt(urlAccountNumber, 10));
        } else if (data?.preferences?.default_account) {
            setAccountNumber(data.preferences.default_account);
        } else if (data?.accounts?.[0]?.account_number) {
            setAccountNumber(data.accounts[0].account_number);
        }
    }, [urlAccountNumber, data?.preferences?.default_account, data?.accounts]);

    const handleAccountOverride = () => {
        const num = parseInt(accountInput, 10);
        if (!isNaN(num) && num > 0) {
            setAccountNumber(num);
            setShowAccountInput(false);
            setAccountInput('');
        }
    };

    return (
        <main className="flex min-w-0 flex-1 flex-col gap-8 pt-8 pb-12 overflow-y-hidden lg:overflow-y-auto">
                <div className="flex flex-row items-center justify-between gap-4 px-4 lg:px-8">
                    <p className="text-xl font-semibold text-primary lg:text-display-xs">MyProjects</p>
                    <div className="flex gap-3">
                        <Button size="md" color="tertiary" iconLeading={SearchLg} className="hidden lg:inline-flex" />
                        {showAccountInput ? (
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={accountInput}
                                    onChange={(e) => setAccountInput(e.target.value)}
                                    placeholder="Account #"
                                    className="w-24 px-3 rounded border border-border bg-card text-foreground text-sm placeholder:text-placeholder text-center"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAccountOverride();
                                        if (e.key === 'Escape') {
                                            setShowAccountInput(false);
                                            setAccountInput('');
                                        }
                                    }}
                                    autoFocus
                                />
                                <Button size="md" color="secondary" onClick={handleAccountOverride}>
                                    Apply
                                </Button>
                                <Button
                                    size="md"
                                    color="tertiary"
                                    onClick={() => {
                                        setShowAccountInput(false);
                                        setAccountInput('');
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <Button size="md" color="secondary" onClick={() => setShowAccountInput(true)}>
                                Override Account
                            </Button>
                        )}
                    </div>
                </div>
                <div className="px-4 lg:px-8">
                    <Suspense fallback={<MMQSkeleton />}>
                        {accountNumber ? (
                            <ProjectsContent accountNumber={accountNumber} onAccountChange={setAccountNumber} />
                        ) : (
                            <MMQSkeleton />
                        )}
                    </Suspense>
                </div>
            </main>
    );
}
