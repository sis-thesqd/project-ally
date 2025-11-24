'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MMQ, MMQSkeleton } from '@sis-thesqd/mmq-component';
import { SidebarNavigationSlim } from '@/components/application/app-navigation/sidebar-navigation/sidebar-slim';
import { Button } from '@/components/base/buttons/button';
import {
    BarChartSquare02,
    CheckDone01,
    HomeLine,
    PieChart03,
    Rows01,
    SearchLg,
    Users01,
} from '@untitledui/icons';

interface ProjectsContentProps {
    accountNumber: number;
    onAccountChange: (account: number) => void;
}

function ProjectsContent({ accountNumber, onAccountChange }: ProjectsContentProps) {
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const apiUrl = process.env.NEXT_PUBLIC_MMQ_API_URL || '';

    useEffect(() => {
        setIsInitialLoad(false);
    }, []);

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
            onError={(error) => console.error('MMQ Error:', error)}
            onDataLoaded={(data) => console.log('Data loaded:', data)}
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
        <div className="flex flex-col bg-primary lg:flex-row">
            <SidebarNavigationSlim
                activeUrl="/projects"
                items={[
                    {
                        label: 'Home',
                        href: '/',
                        icon: HomeLine,
                    },
                    {
                        label: 'Dashboard',
                        href: '/dashboard',
                        icon: BarChartSquare02,
                    },
                    {
                        label: 'Projects',
                        href: '/projects',
                        icon: Rows01,
                    },
                    {
                        label: 'Tasks',
                        href: '/tasks',
                        icon: CheckDone01,
                    },
                    {
                        label: 'Reporting',
                        href: '/reporting',
                        icon: PieChart03,
                    },
                    {
                        label: 'Users',
                        href: '/users',
                        icon: Users01,
                    },
                ]}
            />
            <main className="flex min-w-0 flex-1 flex-col gap-8 pt-8 pb-12">
                <div className="flex flex-col justify-between gap-4 px-4 lg:flex-row lg:px-8">
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
                                    className="w-36 px-3 rounded border border-border bg-card text-foreground"
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
        </div>
    );
}
