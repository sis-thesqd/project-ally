'use client';

import React, { useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { MMQ, MMQSkeleton } from '@sis-thesqd/mmq-component';
import { Button } from '@/components/base/buttons/button';
import { SearchLg } from '@untitledui/icons';
import { useInitData } from '@/contexts/InitDataContext';

interface ProjectsContentProps {
    accountNumber: number;
}

function ProjectsContent({ accountNumber }: ProjectsContentProps) {
    const apiUrl = process.env.NEXT_PUBLIC_MMQ_API_URL || '';

    const handleError = useCallback((error: any) => {
        console.error('MMQ Error:', error);
    }, []);

    const handleDataLoaded = useCallback((data: any) => {
        console.log('Data loaded for account', accountNumber, 'Tasks:', data?.tasks?.length || 0);
    }, [accountNumber]);

    const handleChangesApplied = useCallback(() => {
        console.log('Changes applied');
    }, []);

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
            onError={handleError}
            onDataLoaded={handleDataLoaded}
            onChangesApplied={handleChangesApplied}
        />
    );
}

export default function ProjectsPage() {
    const searchParams = useSearchParams();
    const { data } = useInitData();
    const urlAccountNumber = searchParams.get('accountNumber');

    const [showAccountInput, setShowAccountInput] = useState(false);
    const [accountInput, setAccountInput] = useState('');
    // Local override only used for the "Override Account" input feature (not sidebar)
    const [inputOverride, setInputOverride] = useState<number | null>(null);

    // URL override takes precedence, then input override, then preferences
    const urlOverride = urlAccountNumber ? parseInt(urlAccountNumber, 10) : null;

    // Account number priority: URL param > input override > user preference > first account
    const accountNumber = urlOverride
        ?? inputOverride
        ?? data?.preferences?.default_account
        ?? data?.accounts?.[0]?.account_number
        ?? null;

    const handleAccountOverride = () => {
        const num = parseInt(accountInput, 10);
        if (!isNaN(num) && num > 0) {
            setInputOverride(num);
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
                            <ProjectsContent key={accountNumber} accountNumber={accountNumber} />
                        ) : (
                            <MMQSkeleton />
                        )}
                    </Suspense>
                </div>
            </main>
    );
}
