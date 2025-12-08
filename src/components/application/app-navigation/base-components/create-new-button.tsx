"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createSubmission, getInProgressSubmissions, type Submission } from "@/services/submissions";
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
    const { clearFormState, loadSubmission, setSubmissionId, setSubmitter } = useCreateContext();
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
                // User has an in-progress submission
                const existingSub = inProgressSubmissions[0]; // Get the most recent one
                setExistingSubmission(existingSub);

                // Navigate to the form page first, then show modal
                // This way the modal appears over the form page, not the dashboard
                const formUrl = `/create/${existingSub.submission_id}/1`;
                router.push(formUrl);

                // Show modal after a brief delay to let navigation start
                // The modal will overlay the form page
                setTimeout(() => {
                    setShowOverlay(false);
                    setIsChecking(false);
                    setShowModal(true);
                }, 100);
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

            // Get submitter from user data
            const submitter = data?.email || data?.clickup_id?.toString() || "unknown";

            // Create new submission with empty form data (status: started)
            const submission = await createSubmission({
                submitter,
                status: "started",
                form_data: {
                    mode: "simple",
                    selectedProjectIds: [],
                    allProjects: [],
                },
            });

            // Set submission ID and submitter in context so page doesn't reload from Supabase
            setSubmissionId(submission.submission_id);
            setSubmitter(submitter);

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
