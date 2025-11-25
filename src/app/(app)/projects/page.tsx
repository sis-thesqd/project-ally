'use client';

import React, { useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { MMQ, MMQSkeleton } from '@sis-thesqd/mmq-component';
import { Settings01 } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { Toggle } from '@/components/base/toggle/toggle';
import { SlideoutMenu } from '@/components/application/slideout-menus/slideout-menu';
import { useInitData } from '@/contexts/InitDataContext';

interface ProjectsContentProps {
    accountNumber: number;
    splitOutActive: boolean;
}

function ProjectsContent({ accountNumber, splitOutActive }: ProjectsContentProps) {
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
            splitOutActive={splitOutActive}
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

    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [accountInput, setAccountInput] = useState('');
    const [inputOverride, setInputOverride] = useState<number | null>(null);
    const [splitOutActive, setSplitOutActive] = useState(false);

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
            setAccountInput('');
        }
    };

    const handleClearOverride = () => {
        setInputOverride(null);
        setAccountInput('');
    };

    return (
        <main className="flex min-w-0 flex-1 flex-col gap-8 pt-8 pb-12 overflow-y-hidden lg:overflow-y-auto">
            <div className="flex flex-row items-center justify-between gap-4 px-4 lg:px-8">
                <p className="text-xl font-semibold text-primary lg:text-display-xs">MyProjects</p>
                <div className="flex gap-3">
                    <SlideoutMenu.Trigger isOpen={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
                        <Button size="md" color="secondary" iconLeading={Settings01}>
                            Options
                        </Button>
                        <SlideoutMenu isDismissable>
                            <SlideoutMenu.Header onClose={() => setIsOptionsOpen(false)} className="relative flex w-full flex-col gap-0.5 px-4 pt-6 md:px-6">
                                <h1 className="text-md font-semibold text-primary md:text-lg">Options</h1>
                                <p className="text-sm text-tertiary">Configure view settings.</p>
                            </SlideoutMenu.Header>
                            <SlideoutMenu.Content>
                                <div className="flex flex-col gap-6">
                                    {/* Override Account Section */}
                                    <div className="flex flex-col gap-4">
                                        <p className="text-sm font-semibold text-primary">Override Account</p>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    value={accountInput}
                                                    onChange={(e) => setAccountInput(e.target.value)}
                                                    placeholder="Enter account number"
                                                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-primary text-primary text-sm placeholder:text-placeholder"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleAccountOverride();
                                                    }}
                                                />
                                                <Button size="md" color="secondary" onClick={handleAccountOverride}>
                                                    Apply
                                                </Button>
                                            </div>
                                            {inputOverride && (
                                                <div className="flex items-center justify-between px-2 py-1.5 rounded bg-secondary">
                                                    <span className="text-sm text-secondary">
                                                        Currently viewing: <span className="font-medium text-primary">{inputOverride}</span>
                                                    </span>
                                                    <Button size="sm" color="link-color" onClick={handleClearOverride}>
                                                        Clear
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Display Options Section */}
                                    <div className="flex flex-col gap-4">
                                        <p className="text-sm font-semibold text-primary">Display Options</p>
                                        <div className="flex flex-col gap-3 pl-2">
                                            <Toggle
                                                size="md"
                                                label="Split Active Column"
                                                hint="Show 'With TheSquad' and 'Action Required' columns instead of Active"
                                                isSelected={splitOutActive}
                                                onChange={setSplitOutActive}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </SlideoutMenu.Content>
                            <SlideoutMenu.Footer className="flex w-full items-center justify-end gap-3">
                                <Button size="md" color="secondary" onClick={() => setIsOptionsOpen(false)}>
                                    Close
                                </Button>
                            </SlideoutMenu.Footer>
                        </SlideoutMenu>
                    </SlideoutMenu.Trigger>
                </div>
            </div>
            <div className="px-4 lg:px-8">
                <Suspense fallback={<MMQSkeleton />}>
                    {accountNumber ? (
                        <ProjectsContent
                            key={`${accountNumber}-${splitOutActive}`}
                            accountNumber={accountNumber}
                            splitOutActive={splitOutActive}
                        />
                    ) : (
                        <MMQSkeleton />
                    )}
                </Suspense>
            </div>
        </main>
    );
}
