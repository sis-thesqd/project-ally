"use client";

import { lazy, Suspense } from "react";

// @ts-ignore - Module Federation remote
const MMQ = lazy(() => import("mmq/MMQ"));

export default function ProjectsPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-primary">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-utility-brand-600 border-t-transparent" />
                        <p className="text-sm text-secondary">Loading MMQ...</p>
                    </div>
                </div>
            }
        >
            <MMQ accountNumber={306} showCountdownTimers={true} showAccountOverride={true} />
        </Suspense>
    );
}
