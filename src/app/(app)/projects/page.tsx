'use client';

import React, { useState, Suspense, useCallback, useEffect } from 'react';
import type { Key } from 'react-aria-components';
import { useSearchParams } from 'next/navigation';
import { MMQ, MMQSkeleton } from '@sis-thesqd/mmq-component';
import { Settings01 } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { Toggle } from '@/components/base/toggle/toggle';
import { SlideoutMenu } from '@/components/application/slideout-menus/slideout-menu';
import { PinInput } from '@/components/base/pin-input/pin-input';
import { Tabs } from '@/components/application/tabs/tabs';
import { NativeSelect } from '@/components/base/select/select-native';
import { useInitData } from '@/contexts/InitDataContext';

const viewTabs = [
    { id: 'board', label: 'Board' },
    { id: 'table', label: 'Table' },
];

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
    const { data, updatePreferences } = useInitData();
    const urlAccountNumber = searchParams.get('accountNumber');

    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [accountInput, setAccountInput] = useState('');
    const [inputOverride, setInputOverride] = useState<number | null>(null);
    const [splitOutActive, setSplitOutActive] = useState(data?.preferences?.mmq_split_active ?? false);
    const [selectedView, setSelectedView] = useState<Key>(data?.preferences?.default_mmq_view ?? 'board');

    // Sync splitOutActive with preferences when data loads
    useEffect(() => {
        if (data?.preferences?.mmq_split_active !== undefined && data?.preferences?.mmq_split_active !== null) {
            setSplitOutActive(data.preferences.mmq_split_active);
        }
    }, [data?.preferences?.mmq_split_active]);

    // Sync selectedView with preferences when data loads
    useEffect(() => {
        if (data?.preferences?.default_mmq_view) {
            setSelectedView(data.preferences.default_mmq_view);
        }
    }, [data?.preferences?.default_mmq_view]);

    const handleSplitOutActiveChange = (value: boolean) => {
        setSplitOutActive(value);
        updatePreferences({ mmq_split_active: value });
    };

    const handleViewChange = (value: Key) => {
        setSelectedView(value);
        if (value === 'board' || value === 'table') {
            updatePreferences({ default_mmq_view: value });
        }
    };

    // URL override takes precedence, then input override, then preferences
    const urlOverride = urlAccountNumber ? parseInt(urlAccountNumber, 10) : null;

    // Account number priority: URL param > input override > user preference > first account
    const accountNumber = urlOverride
        ?? inputOverride
        ?? data?.preferences?.default_account
        ?? data?.accounts?.[0]?.account_number
        ?? null;

    const handleAccountOverride = (value: string) => {
        if (value.length >= 3) {
            const num = parseInt(value, 10);
            if (!isNaN(num) && num > 0) {
                setInputOverride(num);
                setAccountInput('');
            }
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
                                        <PinInput size="xs">
                                            <PinInput.Label>Override Account</PinInput.Label>
                                            <div className="flex items-center gap-6">
                                                <PinInput.Group
                                                    maxLength={4}
                                                    value={accountInput}
                                                    onChange={setAccountInput}
                                                >
                                                    <PinInput.Slot index={0} />
                                                    <PinInput.Slot index={1} />
                                                    <PinInput.Slot index={2} />
                                                    <PinInput.Slot index={3} />
                                                </PinInput.Group>
                                                <Button
                                                    size="md"
                                                    color="primary"
                                                    isDisabled={accountInput.length < 3}
                                                    onClick={() => handleAccountOverride(accountInput)}
                                                >
                                                    Apply
                                                </Button>
                                            </div>
                                        </PinInput>
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

                                    {/* View Type Section */}
                                    <div className="flex flex-col gap-4">
                                        <p className="text-sm font-medium text-secondary">View</p>
                                        <NativeSelect
                                            aria-label="View"
                                            value={selectedView as string}
                                            onChange={(event) => handleViewChange(event.target.value)}
                                            options={viewTabs.map((tab) => ({ label: tab.label, value: tab.id }))}
                                            className="md:hidden"
                                        />
                                        <Tabs selectedKey={selectedView} onSelectionChange={handleViewChange} className="w-fit max-md:hidden">
                                            <Tabs.List type="button-border" items={viewTabs}>
                                                {(tab) => <Tabs.Item {...tab} />}
                                            </Tabs.List>
                                        </Tabs>
                                    </div>

                                    {/* Display Options Section - Only show for Board view */}
                                    {selectedView === 'board' && (
                                        <div className="flex flex-col gap-4">
                                            <p className="text-sm font-medium text-secondary">Display Options</p>
                                            <div className="flex flex-col gap-3 pl-2">
                                                <Toggle
                                                    size="md"
                                                    label="Split Active Column"
                                                    hint=""
                                                    isSelected={splitOutActive}
                                                    onChange={handleSplitOutActiveChange}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </SlideoutMenu.Content>
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
