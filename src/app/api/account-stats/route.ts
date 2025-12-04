import { createServerSupabase, supabaseReadOnly } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const accountNumber = searchParams.get('account');

        if (!accountNumber) {
            return NextResponse.json({ error: 'Account number is required' }, { status: 400 });
        }

        const supabase = await createServerSupabase();

        // Get the authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user?.email) {
            console.error('Auth error:', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Call the RPC with the account number and squad names
        // Function: get_project_counts_by_account(p_account bigint, p_responsible_departments text[])
        const { data, error } = await supabaseReadOnly.rpc(
            'get_project_counts_by_account',
            {
                p_account: parseInt(accountNumber, 10),
                p_responsible_departments: ['Design Squad', 'Video Squad']
            },
            { get: true }
        );

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch account stats' }, { status: 500 });
    }
}
