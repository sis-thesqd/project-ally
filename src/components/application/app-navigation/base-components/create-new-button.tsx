"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createSubmission, getLatestSubmission, detectDeviceType, type Submission } from "@/services/submissions";
import { handleError } from "@/services/error-reporting";
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
    const { data, getAccountPreferences } = useInitData();
    const { clearFormState, loadSubmission, setSubmissionId, setSubmitter, setSelectedAccount, setMode, setIsExistingSubmission } = useCreateContext();
    const clearProjectStore = useProjectStore((state) => state.clearProjects);
    const setProjectsInStore = useProjectStore((state) => state.setSelectedProjects);

    const [isLoading, setIsLoading] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
    const [targetUrl, setTargetUrl] = useState<string | null>(null);

    // Hide loading overlay when we reach the target URL
    useEffect(() => {
        if (targetUrl && pathname === targetUrl) {
            setShowOverlay(false);
            setIsLoading(false);
            setTargetUrl(null);
        }
    }, [pathname, targetUrl]);

    const handleClick = async () => {
        if (isLoading) return;

        setIsLoading(true);
        setShowOverlay(true);

        try {
            // Single API call to get the latest submission
            const latestSubmission = await getLatestSubmission();

            // Only show modal if latest submission has status 'in_progress'
            if (latestSubmission?.status === "in_progress") {
                // Show modal - don't navigate yet
                setExistingSubmission(latestSubmission);
                setShowOverlay(false);
                setShowModal(true);
                // Keep isLoading true so button stays disabled while modal is open
            } else {
                // No active submission or status is not 'in_progress' - create new
                await createNewSubmission();
            }
        } catch (error) {
            console.error("Failed to check for existing submissions:", error);
            // On error, try to create a new submission
            await createNewSubmission();
        }
    };

    const createNewSubmission = async () => {
        setShowOverlay(true);
        onCreating?.();

        try {
            // Clear any existing form state (both CreateContext and Zustand store)
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
                    action: "createNewSubmission",
                });
                onError?.(error);
                setIsLoading(false);
                setShowOverlay(false);
                return;
            }

            // Get default mode from account preferences
            const accountPrefs = getAccountPreferences(accountNumber);
            const defaultMode = accountPrefs?.default_submission_mode || "simple";

            // Create new submission with empty form data (status: started)
            const submission = await createSubmission({
                submitter,
                status: "started",
                form_data: {
                    mode: defaultMode,
                    selectedProjectIds: [],
                },
                device_last_viewed_on: detectDeviceType(),
                selected_account: accountNumber,
            });

            // Set submission data in context (prevents page from reloading from Supabase)
            setSubmissionId(submission.submission_id);
            setSubmitter(submitter);
            setSelectedAccount(accountNumber);
            setMode(defaultMode);
            setIsExistingSubmission(false); // New submission - QR shows after first change

            onCreated?.(submission.submission_id);

            // Set target URL so we hide overlay when navigation completes
            const newUrl = `/create/${submission.submission_id}/1`;
            setTargetUrl(newUrl);

            // Navigate to form
            router.push(newUrl);
        } catch (error) {
            console.error("Failed to create submission:", error);
            const err = error instanceof Error ? error : new Error("Failed to create submission");
            await handleError(err, "Failed to create request", "Please try again. If the problem persists, contact support.", {
                submitter: data?.email,
                action: "createNewSubmission",
            });
            onError?.(err);
            setIsLoading(false);
            setShowOverlay(false);
        }
    };

    const handleContinueExisting = async (submission: Submission) => {
        setShowModal(false);
        setShowOverlay(true);

        try {
            // Mark as existing submission FIRST for QR notification (shows after form renders)
            // This must be set before loadSubmission so it's available when page mounts
            setIsExistingSubmission(true);

            // Load the submission data into context
            await loadSubmission(submission.submission_id);

            // Sync selectedProjectIds to Zustand store
            if (submission.form_data.selectedProjectIds && submission.form_data.selectedProjectIds.length > 0) {
                setProjectsInStore(submission.form_data.selectedProjectIds);
            }

            // Navigate to form
            const formUrl = `/create/${submission.submission_id}/1`;
            setTargetUrl(formUrl);
            router.push(formUrl);
        } catch (error) {
            console.error("Failed to load submission:", error);
            setIsExistingSubmission(false);
            setShowOverlay(false);
            setIsLoading(false);
        }
    };

    const handleStartFresh = async () => {
        setShowModal(false);
        setExistingSubmission(null);
        await createNewSubmission();
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setExistingSubmission(null);
        setIsLoading(false);
    };

    return (
        <>
            <LoadingOverlay isVisible={showOverlay} label="Loading..." />
            <ContinueSubmissionModal isOpen={showModal} onClose={handleCloseModal} onContinue={handleContinueExisting} onStartFresh={handleStartFresh} existingSubmission={existingSubmission} />
            <button type="button" onClick={handleClick} disabled={isLoading} className={className}>
                {children}
            </button>
        </>
    );
}
