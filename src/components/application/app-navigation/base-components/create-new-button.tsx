"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createSubmission, getInProgressSubmissions, hasFormProgress, detectDeviceType, type Submission } from "@/services/submissions";
import { useInitData } from "@/contexts/InitDataContext";
import { LoadingOverlay } from "@/components/application/loading-overlay/loading-overlay";
import { ContinueSubmissionModal } from "@/components/application/modals/continue-submission-modal";
import { useCreateContext } from "@/app/(app)/create/CreateContext";
import { useProjectStore } from "@sis-thesqd/prf-project-selection";

interface CreateNewButtonProps {
    children: ReactNode;
    className?: string;
    onCreating?: () => void;
    onCreated?: (submissionId: string) => void;
    onError?: (error: Error) => void;
}

export function CreateNewButton({ children, className, onCreating, onCreated, onError }: CreateNewButtonProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { data } = useInitData();
    const { clearFormState, loadSubmission, setSubmissionId, setSubmitter, setSelectedAccount } = useCreateContext();
    const clearProjectStore = useProjectStore(state => state.clearProjects);
    const [isChecking, setIsChecking] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
    const [targetUrl, setTargetUrl] = useState<string | null>(null);

    // Hide loading overlay when we reach the target URL
    useEffect(() => {
        if (targetUrl && pathname === targetUrl) {
            setShowOverlay(false);
            setIsCreating(false);
            setIsChecking(false);
            setTargetUrl(null);
        }
    }, [pathname, targetUrl]);

    const handleClick = async () => {
        if (isChecking || isCreating) return;

        setIsChecking(true);
        setShowOverlay(true);

        try {
            // Check for existing in-progress submissions
            const inProgressSubmissions = await getInProgressSubmissions();

            if (inProgressSubmissions.length > 0) {
                const existingSub = inProgressSubmissions[0]; // Get the most recent one

                // Only show modal if the submission has meaningful progress
                if (hasFormProgress(existingSub.form_data)) {
                    // User has real progress, show the continue/start fresh modal
                    setExistingSubmission(existingSub);

                    // Navigate to the form page first, then show modal
                    const formUrl = `/create/${existingSub.submission_id}/1`;
                    router.push(formUrl);

                    // Show modal after a brief delay to let navigation start
                    setTimeout(() => {
                        setShowOverlay(false);
                        setIsChecking(false);
                        setShowModal(true);
                    }, 100);
                } else {
                    // Submission exists but is empty - just continue with it (no modal)
                    await loadSubmission(existingSub.submission_id);
                    setSubmissionId(existingSub.submission_id);
                    setSubmitter(existingSub.submitter);

                    const formUrl = `/create/${existingSub.submission_id}/1`;
                    setTargetUrl(formUrl);
                    router.push(formUrl);
                }
            } else {
                // No in-progress submissions, create a new one
                await createNewSubmission();
            }
        } catch (error) {
            console.error("Failed to check for existing submissions:", error);
            // On error, just try to create a new submission
            await createNewSubmission();
        }
    };

    const createNewSubmission = async () => {
        setIsCreating(true);
        setShowOverlay(true);
        onCreating?.();

        try {
            // Clear any existing form state first (both CreateContext and Zustand store)
            clearFormState();
            clearProjectStore();

            // Get submitter and selected account from user data
            const submitter = data?.email || data?.clickup_id?.toString() || "unknown";
            const accountNumber = data?.preferences?.default_account ?? null;

            // Create new submission with empty form data (status: started)
            const submission = await createSubmission({
                submitter,
                status: "started",
                form_data: {
                    selectedAccount: accountNumber,
                    mode: "simple",
                    selectedProjectIds: [],
                },
                device_last_viewed_on: detectDeviceType(),
            });

            // Set submission ID, submitter, and selected account in context so page doesn't reload from Supabase
            setSubmissionId(submission.submission_id);
            setSubmitter(submitter);
            setSelectedAccount(accountNumber);

            onCreated?.(submission.submission_id);

            // Set target URL so we hide overlay when navigation completes
            const newUrl = `/create/${submission.submission_id}/1`;
            setTargetUrl(newUrl);

            // Navigate immediately - the form page will see context already has the submission
            router.push(newUrl);
        } catch (error) {
            console.error("Failed to create submission:", error);
            onError?.(error instanceof Error ? error : new Error("Failed to create submission"));
            setIsCreating(false);
            setShowOverlay(false);
            setIsChecking(false);
        }
    };

    const handleContinueExisting = async (submission: Submission) => {
        setShowModal(false);
        setShowOverlay(true);

        try {
            // Load the submission data into context
            await loadSubmission(submission.submission_id);

            // We already navigated to the form page in handleClick,
            // so just hide the overlay - no additional navigation needed
            setShowOverlay(false);
            setIsChecking(false);
        } catch (error) {
            console.error("Failed to load submission:", error);
            setShowOverlay(false);
        }
    };

    const handleStartFresh = async () => {
        setShowModal(false);
        await createNewSubmission();
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setExistingSubmission(null);
    };

    return (
        <>
            <LoadingOverlay isVisible={showOverlay} label="Loading..." />
            <ContinueSubmissionModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onContinue={handleContinueExisting}
                onStartFresh={handleStartFresh}
                existingSubmission={existingSubmission}
            />
            <button type="button" onClick={handleClick} disabled={isChecking || isCreating} className={className}>
                {children}
            </button>
        </>
    );
}
