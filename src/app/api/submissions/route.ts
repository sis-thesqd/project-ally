import { createServerSupabase } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface SubmissionFormData {
    mode?: string;
    selectedProjectIds?: number[];
    allProjects?: unknown[];
    generalInfo?: unknown;
    designStyle?: unknown;
    creativeDirection?: unknown;
    deliverableDetails?: unknown;
}

interface CreateSubmissionBody {
    submitter: string;
    status?: string;
    form_data: SubmissionFormData;
}

interface UpdateSubmissionBody {
    submission_id: string;
    status?: string;
    form_data: SubmissionFormData;
}

// POST - Create new submission
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // Get the authenticated user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user?.email) {
            console.error("Auth error:", authError);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body: CreateSubmissionBody;
        try {
            body = await request.json();
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from("pa_prf_submissions")
            .insert({
                submitter: body.submitter || user.email,
                status: body.status || "started",
                form_data: body.form_data,
                updated_at: now,
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
    }
}

// PUT - Update existing submission
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // Get the authenticated user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user?.email) {
            console.error("Auth error:", authError);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body: UpdateSubmissionBody = await request.json();

        if (!body.submission_id) {
            return NextResponse.json({ error: "submission_id is required" }, { status: 400 });
        }

        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from("pa_prf_submissions")
            .update({
                form_data: body.form_data,
                status: body.status || "started",
                updated_at: now,
            })
            .eq("submission_id", body.submission_id)
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
    }
}

// GET - Fetch submission by ID or fetch in_progress submissions for current user
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // Get the authenticated user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user?.email) {
            console.error("Auth error:", authError);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const submissionId = searchParams.get("id");
        const status = searchParams.get("status");

        // If status is provided, fetch submissions with that status for the current user
        if (status) {
            const { data, error } = await supabase
                .from("pa_prf_submissions")
                .select()
                .eq("submitter", user.email)
                .eq("status", status)
                .order("updated_at", { ascending: false });

            if (error) {
                console.error("Supabase error:", error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json(data);
        }

        // If id is provided, fetch specific submission
        if (submissionId) {
            const { data, error } = await supabase.from("pa_prf_submissions").select().eq("submission_id", submissionId).single();

            if (error) {
                if (error.code === "PGRST116") {
                    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
                }
                console.error("Supabase error:", error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json(data);
        }

        return NextResponse.json({ error: "id or status query parameter is required" }, { status: 400 });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 });
    }
}
