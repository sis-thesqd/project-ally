'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MMQ, MMQSkeleton } from '@sis-thesqd/mmq-component';
import { SidebarNavigationSlim } from '@/components/application/app-navigation/sidebar-navigation/sidebar-slim';
import { ThemeToggle } from '@/components/application/theme-toggle';
import {
    BarChartSquare02,
    CheckDone01,
    HomeLine,
    PieChart03,
    Rows01,
    Users01,
} from '@untitledui/icons';

function ProjectsContent() {
    const searchParams = useSearchParams();
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const apiUrl = process.env.NEXT_PUBLIC_MMQ_API_URL || '';
    const urlAccountNumber = searchParams.get('accountNumber');
    const defaultAccount = urlAccountNumber ? parseInt(urlAccountNumber, 10) : 306;

    useEffect(() => {
        setIsInitialLoad(false);
    }, []);

    if (isInitialLoad) {
        return <MMQSkeleton />;
    }

    return (
        <MMQ
            accountNumber={defaultAccount}
            supabaseUrl=""
            supabaseKey=""
            dataEndpoint={`${apiUrl}/api/queue-data`}
            reorderEndpoint={`${apiUrl}/api/reorder`}
            playPauseEndpoint={`${apiUrl}/api/play-pause`}
            showAccountOverride={true}
            showCountdownTimers={true}
            title="MyProjects"
            onError={(error) => console.error('MMQ Error:', error)}
            onDataLoaded={(data) => console.log('Data loaded:', data)}
            onChangesApplied={() => console.log('Changes applied')}
        />
    );
}

export default function ProjectsPage() {
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
                <div className="flex justify-end px-4 lg:px-8">
                    <ThemeToggle />
                </div>
                <div className="px-4 lg:px-8">
                    <Suspense fallback={<MMQSkeleton />}>
                        <ProjectsContent />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}
