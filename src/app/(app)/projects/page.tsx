'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MMQ, MMQSkeleton } from '@sis-thesqd/mmq-component';
import { Button } from '@/components/base/buttons/button';
import { SearchLg } from '@untitledui/icons';

interface ProjectsContentProps {
    accountNumber: number;
    onAccountChange: (account: number) => void;
}

function ProjectsContent({ accountNumber, onAccountChange }: ProjectsContentProps) {
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [cachedData, setCachedData] = useState<any>(null);

    const apiUrl = process.env.NEXT_PUBLIC_MMQ_API_URL || '';
    const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds
    const CACHE_KEY = `mmq_cache_${accountNumber}`;

    useEffect(() => {
        // Check for cached data on mount
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                const { data, timestamp } = JSON.parse(cached);
                const now = Date.now();
                if (now - timestamp < CACHE_DURATION) {
                    setCachedData(data);
                    console.log('Using cached data for account', accountNumber);
                } else {
                    sessionStorage.removeItem(CACHE_KEY);
                    console.log('Cache expired for account', accountNumber);
                }
            } catch (error) {
                console.error('Error parsing cached data:', error);
                sessionStorage.removeItem(CACHE_KEY);
            }
        }
        setIsInitialLoad(false);
    }, [accountNumber, CACHE_KEY, CACHE_DURATION]);

    const handleDataLoaded = (data: any) => {
        console.log('Data loaded:', data);
        // Store data in cache with timestamp
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    };

    if (isInitialLoad) {
        return <MMQSkeleton />;
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
    const urlAccountNumber = searchParams.get('accountNumber');
    const defaultAccount = urlAccountNumber ? parseInt(urlAccountNumber, 10) : 306;
    const [accountNumber, setAccountNumber] = useState(defaultAccount);
    const [showAccountInput, setShowAccountInput] = useState(false);
    const [accountInput, setAccountInput] = useState('');

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
                                <Button size="md" color="secondary" onPress={handleAccountOverride}>
                                    Apply
                                </Button>
                                <Button
                                    size="md"
                                    color="tertiary"
                                    onPress={() => {
                                        setShowAccountInput(false);
                                        setAccountInput('');
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <Button size="md" color="secondary" onPress={() => setShowAccountInput(true)}>
                                Override Account
                            </Button>
                        )}
                    </div>
                </div>
                <div className="px-4 lg:px-8">
                    <Suspense fallback={<MMQSkeleton />}>
                        <ProjectsContent accountNumber={accountNumber} onAccountChange={setAccountNumber} />
                    </Suspense>
                </div>
            </main>
    );
}
