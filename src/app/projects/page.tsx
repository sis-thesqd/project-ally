'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MMQ, MMQSkeleton } from '@sis-thesqd/mmq-component';

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
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-4">
                <Suspense fallback={<MMQSkeleton />}>
                    <ProjectsContent />
                </Suspense>
            </div>
        </div>
    );
}
