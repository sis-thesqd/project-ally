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

        // Call the RPC with the account number
        const { data, error } = await supabaseReadOnly.rpc(
            'get_account_task_stats',
            { account_id_param: parseInt(accountNumber, 10) },
            { get: true }
        );

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch task stats' }, { status: 500 });
    }
}

