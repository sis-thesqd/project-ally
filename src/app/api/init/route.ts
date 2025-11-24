import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_READ_ONLY!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const inputEmail = 'jacob@churchmediasquad.com';

        const { data, error } = await supabase.rpc('pa_init_data', { input_email: inputEmail }, { get: true });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch init data' }, { status: 500 });
    }
}
