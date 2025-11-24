import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface PreferencesBody {
    email: string;
    default_account?: number;
    default_theme?: 'light' | 'dark';
}

export async function POST(request: NextRequest) {
    try {
        const body: PreferencesBody = await request.json();
        const { email, default_account, default_theme } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('pa_user_preferences')
            .upsert(
                {
                    email,
                    default_account,
                    default_theme,
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
