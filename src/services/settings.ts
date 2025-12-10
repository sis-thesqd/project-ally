/**
 * Settings service for managing account preferences
 */

export type SubmissionMode = "simple" | "advanced";

export interface AccountPreferencesUpdate {
    default_submission_mode?: SubmissionMode;
    dont_show_mobile_qr_code_again?: boolean;
    hidden_banners?: string[];
}

/**
 * Update account preferences
 */
export async function updateAccountPreferences(
    accountNumber: number,
    preferences: AccountPreferencesUpdate
): Promise<void> {
    const response = await fetch("/api/account-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_number: accountNumber, preferences }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to update account preferences" }));
        throw new Error(error.error || "Failed to update account preferences");
    }

    return response.json();
}

