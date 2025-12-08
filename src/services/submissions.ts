/**
 * PRF Submissions Service
 *
 * Handles all operations related to PRF (Project Request Form) submissions.
 * This service communicates with the /api/submissions endpoint which manages
 * the pa_prf_submissions table in Supabase.
 *
 * Submission Status Flow (prf_submission_status enum):
 * - "started": Initial status when submission is first created
 * - "in_progress": Status set when user makes any changes to the form
 * - "submitted": Status set when user completes and submits the form
 * - "error": Status set when an error occurs during submission processing
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Form data payload stored in Supabase.
 * Only essential user-input data - no derived/fetched data like allProjects.
 * Keys are ordered by page/step in the form wizard.
 * Note: selectedAccount is stored as a separate column, NOT in form_data.
 */
export type DeviceType = "desktop" | "mobile" | "other";

export interface SubmissionFormData {
    // Step 1: Project Selection
    mode?: string;
    selectedProjectIds?: number[];

    // Step 2: General Info
    generalInfo?: unknown;

    // Step 3: Design Style
    designStyle?: unknown;

    // Step 4: Creative Direction
    creativeDirection?: unknown;

    // Step 5: Deliverable Details
    deliverableDetails?: unknown;
}

/**
 * Detect the current device type based on user agent and screen width.
 */
export function detectDeviceType(): DeviceType {
    if (typeof window === "undefined") return "other";

    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isSmallScreen = window.innerWidth < 768;

    if (isMobileUA || isSmallScreen) {
        return "mobile";
    }

    return "desktop";
}

/**
 * Submission status enum matching Supabase prf_submission_status type.
 * - "started": Initial status when submission is first created
 * - "in_progress": Status set when user makes any changes to the form
 * - "submitted": Status set when user completes and submits the form
 * - "error": Status set when an error occurs during submission
 */
export type SubmissionStatus = "started" | "in_progress" | "submitted" | "error";

export interface Submission {
    submission_id: string;
    submitter: string;
    status: SubmissionStatus;
    form_data: SubmissionFormData;
    selected_account: number;
    device_last_viewed_on: DeviceType | null;
    updated_at: string;
    created_at: string;
}

export interface CreateSubmissionParams {
    submitter: string;
    status?: "started" | "in_progress";
    form_data: SubmissionFormData;
    device_last_viewed_on?: DeviceType;
    selected_account: number;
}

export interface UpdateSubmissionParams {
    submission_id: string;
    status?: SubmissionStatus;
    form_data: SubmissionFormData;
    device_last_viewed_on?: DeviceType;
}

export interface UpsertSubmissionParams {
    submission_id?: string;
    submitter: string;
    status?: SubmissionStatus;
    form_data: SubmissionFormData;
    device_last_viewed_on?: DeviceType;
    selected_account?: number;
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
    const { submitter, status = "started", form_data, device_last_viewed_on, selected_account } = params;

    const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submitter, status, form_data, device_last_viewed_on, selected_account }),
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
    const { submission_id, status = "in_progress", form_data, device_last_viewed_on } = params;

    const response = await fetch("/api/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id, status, form_data, device_last_viewed_on }),
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
    const { submission_id, submitter, status, form_data, device_last_viewed_on, selected_account } = params;

    if (submission_id) {
        return updateSubmission({
            submission_id,
            status: status || "in_progress",
            form_data,
            device_last_viewed_on,
        });
    } else {
        if (selected_account === undefined) {
            throw new Error("selected_account is required when creating a new submission");
        }
        return createSubmission({
            submitter,
            status: (status as "started" | "in_progress") || "started",
            form_data,
            device_last_viewed_on,
            selected_account,
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
