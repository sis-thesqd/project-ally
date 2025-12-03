'use client';

import React, { useState, Suspense, useCallback, useEffect } from 'react';
import type { Key } from 'react-aria-components';
import { useSearchParams } from 'next/navigation';
import { MMQ, MMQSkeleton } from '@sis-thesqd/mmq-component';
import type { TableFilterType } from '@sis-thesqd/mmq-component';
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
    autoCollapseEmpty: boolean;
    viewType: 'board' | 'table';
    initialTableFilter?: TableFilterType;
    onTableFilterChange?: (filter: TableFilterType) => void;
}

function ProjectsContent({ accountNumber, splitOutActive, autoCollapseEmpty, viewType, initialTableFilter, onTableFilterChange }: ProjectsContentProps) {
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
            autoCollapseEmpty={autoCollapseEmpty}
            viewType={viewType}
            initialTableFilter={initialTableFilter}
            onTableFilterChange={onTableFilterChange}
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
    const [autoCollapseEmpty, setAutoCollapseEmpty] = useState(data?.preferences?.mmq_auto_collapse_empty ?? true);
    const [tableFilter, setTableFilter] = useState<TableFilterType | undefined>(
        (data?.preferences?.mmq_table_filter as TableFilterType) || undefined
    );

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

    // Sync autoCollapseEmpty with preferences when data loads
    useEffect(() => {
        if (data?.preferences?.mmq_auto_collapse_empty !== undefined && data?.preferences?.mmq_auto_collapse_empty !== null) {
            setAutoCollapseEmpty(data.preferences.mmq_auto_collapse_empty);
        }
    }, [data?.preferences?.mmq_auto_collapse_empty]);

    // Sync tableFilter with preferences when data loads
    useEffect(() => {
        if (data?.preferences?.mmq_table_filter) {
            setTableFilter(data.preferences.mmq_table_filter as TableFilterType);
        }
    }, [data?.preferences?.mmq_table_filter]);

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

    const handleAutoCollapseEmptyChange = (value: boolean) => {
        setAutoCollapseEmpty(value);
        updatePreferences({ mmq_auto_collapse_empty: value });
    };

    const handleTableFilterChange = (filter: TableFilterType) => {
        setTableFilter(filter);
        updatePreferences({ mmq_table_filter: filter });
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

                                    {/* Display Options Section */}
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
                                            {selectedView === 'board' && (
                                                <Toggle
                                                    size="md"
                                                    label="Auto-Collapse Empty Lists"
                                                    hint=""
                                                    isSelected={autoCollapseEmpty}
                                                    onChange={handleAutoCollapseEmptyChange}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </SlideoutMenu.Content>
                        </SlideoutMenu>
                    </SlideoutMenu.Trigger>
                </div>
            </div>
            <div className="px-4 lg:px-8">
                <Suspense fallback={<MMQSkeleton splitOutActive={splitOutActive} viewType={selectedView as 'board' | 'table'} />}>
                    {accountNumber ? (
                        <ProjectsContent
                            key={`${accountNumber}-${splitOutActive}-${autoCollapseEmpty}-${selectedView}-${tableFilter}`}
                            accountNumber={accountNumber}
                            splitOutActive={splitOutActive}
                            autoCollapseEmpty={autoCollapseEmpty}
                            viewType={selectedView as 'board' | 'table'}
                            initialTableFilter={tableFilter}
                            onTableFilterChange={handleTableFilterChange}
                        />
                    ) : (
                        <MMQSkeleton splitOutActive={splitOutActive} viewType={selectedView as 'board' | 'table'} />
                    )}
                </Suspense>
            </div>
        </main>
    );
}
