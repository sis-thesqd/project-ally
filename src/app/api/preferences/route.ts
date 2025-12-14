import { createServerSupabase } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface PreferencesBody {
    default_account?: number;
    default_theme?: 'light' | 'dark';
    mobile_default_theme?: 'system' | 'light' | 'dark';
    mmq_split_active?: boolean;
    default_mmq_view?: 'board' | 'table';
    mmq_auto_collapse_empty?: boolean;
    mmq_table_filter?: string;
    timezone?: string;
    chart_period?: 'weekly' | 'monthly';
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // Get the authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user?.email) {
            console.error('Auth error:', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: PreferencesBody = await request.json();

        // Only include fields that are explicitly provided (not undefined)
        const updateData: Record<string, unknown> = {
            email: user.email,
            row_updated: new Date().toISOString(),
        };

        if (body.default_account !== undefined) updateData.default_account = body.default_account;
        if (body.default_theme !== undefined) updateData.default_theme = body.default_theme;
        if (body.mobile_default_theme !== undefined) updateData.mobile_default_theme = body.mobile_default_theme;
        if (body.mmq_split_active !== undefined) updateData.mmq_split_active = body.mmq_split_active;
        if (body.default_mmq_view !== undefined) updateData.default_mmq_view = body.default_mmq_view;
        if (body.mmq_auto_collapse_empty !== undefined) updateData.mmq_auto_collapse_empty = body.mmq_auto_collapse_empty;
        if (body.mmq_table_filter !== undefined) updateData.mmq_table_filter = body.mmq_table_filter;
        if (body.timezone !== undefined) updateData.timezone = body.timezone;
        if (body.chart_period !== undefined) updateData.chart_period = body.chart_period;

        const { data, error } = await supabase
            .from('pa_user_preferences')
            .upsert(updateData, { onConflict: 'email' })
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }
}
