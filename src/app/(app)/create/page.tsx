"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSubmission, detectDeviceType } from "@/services/submissions";
import { handleError } from "@/services/error-reporting";
import { useInitData } from "@/contexts/InitDataContext";
import { LoadingOverlay } from "@/components/application/loading-overlay/loading-overlay";
import { useCreateContext } from "./CreateContext";
import { useProjectStore } from "@sis-thesqd/prf-project-selection";

export default function CreatePage() {
    const router = useRouter();
    const { data, isReady } = useInitData();
    const { clearFormState, setSubmissionId, setSubmitter, setSelectedAccount } = useCreateContext();
    const clearProjectStore = useProjectStore(state => state.clearProjects);
    const [showOverlay, setShowOverlay] = useState(true);
    const hasCreatedRef = useRef(false);

    useEffect(() => {
        const createAndRedirect = async () => {
            if (!isReady || hasCreatedRef.current) return;
            hasCreatedRef.current = true;

            // Clear any existing form state first (both CreateContext and Zustand store)
            clearFormState();
            clearProjectStore();

            // Get submitter and selected account from user data
            const submitter = data?.email || data?.clickup_id?.toString() || "unknown";
            const accountNumber = data?.preferences?.default_account;

            // Validate that user has a default account set
            if (accountNumber === undefined || accountNumber === null) {
                const error = new Error("No default account configured for user");
                await handleError(error, "Unable to create request", "Please set a default account in your profile settings.", {
                    submitter,
                    action: "createAndRedirect",
                });
                setShowOverlay(false);
                router.replace("/");
                return;
            }

            try {
                // Create new submission with empty form data
                const submission = await createSubmission({
                    submitter,
                    status: "started",
                    form_data: {
                        mode: "simple",
                        selectedProjectIds: [],
                    },
                    device_last_viewed_on: detectDeviceType(),
                    selected_account: accountNumber,
                });

                // Set submission ID, submitter, and selected account in context so page doesn't reload from Supabase
                setSubmissionId(submission.submission_id);
                setSubmitter(submitter);
                setSelectedAccount(accountNumber);

                // Navigate to the new submission's first step immediately
                router.replace(`/create/${submission.submission_id}/1`);
            } catch (error) {
                console.error("Failed to create submission:", error);
                const err = error instanceof Error ? error : new Error("Failed to create submission");
                await handleError(err, "Failed to create request", "Please try again. If the problem persists, contact support.", {
                    submitter,
                    action: "createAndRedirect",
                });
                setShowOverlay(false);
                // Redirect to home on error
                router.replace("/");
            }
        };

        createAndRedirect();
    }, [isReady, data, router, clearFormState, clearProjectStore, setSubmissionId, setSubmitter, setSelectedAccount]);

    return (
        <>
            <LoadingOverlay isVisible={showOverlay} label="Getting your project request ready..." />
            <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
                <div className="mb-6 sm:mb-8 max-w-7xl mx-auto w-full">
                    <h1 className="text-xl sm:text-2xl font-semibold text-primary align-center">New Project Request</h1>
                    <p className="text-secondary mt-1 text-sm sm:text-base">Creating new submission...</p>
                </div>
            </main>
        </>
    );
}
