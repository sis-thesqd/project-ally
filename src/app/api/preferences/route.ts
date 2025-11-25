import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface PreferencesBody {
    default_account?: number;
    default_theme?: 'light' | 'dark';
    mmq_split_active?: boolean;
    default_mmq_view?: 'board' | 'table';
    mmq_auto_collapse_empty?: boolean;
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get the authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user?.email) {
            console.error('Auth error:', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: PreferencesBody = await request.json();
        const { default_account, default_theme, mmq_split_active, default_mmq_view, mmq_auto_collapse_empty } = body;

        const { data, error } = await supabase
            .from('pa_user_preferences')
            .upsert(
                {
                    email: user.email,
                    default_account,
                    default_theme,
                    mmq_split_active,
                    default_mmq_view,
                    mmq_auto_collapse_empty,
                    row_updated: new Date().toISOString(),
                },
                {
                    onConflict: 'email',
                }
            )
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
