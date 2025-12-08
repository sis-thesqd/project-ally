"use client";

import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { X } from "@untitledui/icons";
import type { Submission } from "@/services/submissions";

interface ContinueSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContinue: (submission: Submission) => void;
    onStartFresh: () => void;
    existingSubmission: Submission | null;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export function ContinueSubmissionModal({ isOpen, onClose, onContinue, onStartFresh, existingSubmission }: ContinueSubmissionModalProps) {
    if (!existingSubmission) return null;

    const handleContinue = () => {
        onContinue(existingSubmission);
    };

    return (
        <ModalOverlay isOpen={isOpen} onOpenChange={(open) => !open && onClose()} isDismissable>
            <Modal className="max-w-md">
                <Dialog>
                    <div className="relative w-full rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-4 right-4 rounded-lg p-1 text-fg-quaternary transition-colors hover:bg-secondary hover:text-fg-quaternary_hover"
                        >
                            <X className="size-5" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-primary">Continue where you left off?</h2>
                            <p className="mt-2 text-sm text-secondary">
                                You have an existing project request in progress that was last updated on{" "}
                                <span className="font-medium text-primary">{formatDate(existingSubmission.updated_at)}</span>.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <Button color="tertiary" size="md" onClick={onStartFresh} className="order-2 sm:order-1">
                                Start Fresh
                            </Button>
                            <Button color="primary" size="md" onClick={handleContinue} className="order-1 sm:order-2">
                                Continue Request
                            </Button>
                        </div>
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
}
