/**
 * PRF Submissions Service
 *
 * Handles all operations related to PRF (Project Request Form) submissions.
 * This service communicates with the /api/submissions endpoint which manages
 * the pa_prf_submissions table in Supabase.
 *
 * Submission Status Flow:
 * - "started": Initial status when submission is first created
 * - "in_progress": Status set when user makes any changes to the form
 * - "submitted": Status set when user completes and submits the form
 */

// ============================================================================
// Types
// ============================================================================

export interface SubmissionFormData {
    mode?: string;
    selectedProjectIds?: number[];
    allProjects?: unknown[];
    generalInfo?: unknown;
    designStyle?: unknown;
    creativeDirection?: unknown;
    deliverableDetails?: unknown;
}

export interface Submission {
    submission_id: string;
    submitter: string;
    status: "started" | "in_progress" | "submitted" | string;
    form_data: SubmissionFormData;
    updated_at: string;
    created_at: string;
}

export interface CreateSubmissionParams {
    submitter: string;
    status?: "started" | "in_progress";
    form_data: SubmissionFormData;
}

export interface UpdateSubmissionParams {
    submission_id: string;
    status?: "started" | "in_progress" | "submitted";
    form_data: SubmissionFormData;
}

export interface UpsertSubmissionParams {
    submission_id?: string;
    submitter: string;
    status?: "started" | "in_progress" | "submitted";
    form_data: SubmissionFormData;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Safely parse JSON response, returning null if parsing fails.
 */
async function safeParseJson<T>(response: Response): Promise<T | null> {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

/**
 * Create a new PRF submission.
 * Initial status is "started" by default.
 */
export async function createSubmission(params: CreateSubmissionParams): Promise<Submission> {
    const { submitter, status = "started", form_data } = params;

    const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submitter, status, form_data }),
    });

    if (!response.ok) {
        const error = await safeParseJson<{ error?: string }>(response);
        console.error("Error creating submission:", error || response.statusText);
        throw new Error(`Failed to create submission: ${error?.error || response.statusText}`);
    }

    return response.json();
}

/**
 * Update an existing PRF submission.
 * Use this when syncing form changes - always set status to "in_progress".
 */
export async function updateSubmission(params: UpdateSubmissionParams): Promise<Submission> {
    const { submission_id, status = "in_progress", form_data } = params;

    const response = await fetch("/api/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id, status, form_data }),
    });

    if (!response.ok) {
        const error = await safeParseJson<{ error?: string }>(response);
        console.error("Error updating submission:", error || response.statusText);
        throw new Error(`Failed to update submission: ${error?.error || response.statusText}`);
    }

    return response.json();
}

/**
 * Upsert a PRF submission.
 * - If submission_id is not provided, creates a new submission with status "started"
 * - If submission_id is provided, updates the existing submission with status "in_progress"
 *
 * @deprecated Prefer using createSubmission() or updateSubmission() for clarity
 */
export async function upsertSubmission(params: UpsertSubmissionParams): Promise<Submission> {
    const { submission_id, submitter, status, form_data } = params;

    if (submission_id) {
        return updateSubmission({
            submission_id,
            status: status || "in_progress",
            form_data,
        });
    } else {
        return createSubmission({
            submitter,
            status: (status as "started" | "in_progress") || "started",
            form_data,
        });
    }
}

/**
 * Get a submission by ID.
 * Returns null if submission is not found.
 */
export async function getSubmission(submission_id: string): Promise<Submission | null> {
    const response = await fetch(`/api/submissions?id=${encodeURIComponent(submission_id)}`, {
        method: "GET",
    });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        const error = await safeParseJson<{ error?: string }>(response);
        console.error("Error fetching submission:", error || response.statusText);
        throw new Error(`Failed to fetch submission: ${error?.error || response.statusText}`);
    }

    return response.json();
}

/**
 * Get all in-progress submissions for the current user.
 * Returns submissions ordered by updated_at (most recent first).
 *
 * Use this to check if a user has an existing draft before creating a new one.
 */
export async function getInProgressSubmissions(): Promise<Submission[]> {
    const response = await fetch("/api/submissions?status=in_progress", {
        method: "GET",
    });

    if (!response.ok) {
        const error = await safeParseJson<{ error?: string }>(response);
        console.error("Error fetching in-progress submissions:", error || response.statusText);
        throw new Error(`Failed to fetch in-progress submissions: ${error?.error || response.statusText}`);
    }

    return response.json();
}

/**
 * Check if the current user has an existing in-progress submission.
 * Returns the most recent in-progress submission or null if none exists.
 *
 * This is a convenience wrapper around getInProgressSubmissions() for
 * the common case of checking for a single draft.
 */
export async function getExistingDraft(): Promise<Submission | null> {
    const submissions = await getInProgressSubmissions();
    return submissions.length > 0 ? submissions[0] : null;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create initial empty form data for a new submission.
 */
export function createEmptyFormData(): SubmissionFormData {
    return {
        mode: "simple",
        selectedProjectIds: [],
        allProjects: [],
        generalInfo: null,
        designStyle: null,
        creativeDirection: null,
        deliverableDetails: null,
    };
}

/**
 * Check if form data has any meaningful content (user has made progress).
 */
export function hasFormProgress(formData: SubmissionFormData): boolean {
    return (
        (formData.selectedProjectIds?.length ?? 0) > 0 ||
        formData.generalInfo !== null ||
        formData.designStyle !== null ||
        formData.creativeDirection !== null ||
        formData.deliverableDetails !== null
    );
}
