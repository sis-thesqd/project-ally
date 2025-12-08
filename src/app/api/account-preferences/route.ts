import { createServerSupabase } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface AccountPreferencesBody {
    account_number: number;
    preferences: {
        default_submission_mode?: 'simple' | 'advanced';
        dont_show_mobile_qr_code_again?: boolean;
    };
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

        const body: AccountPreferencesBody = await request.json();
        const { account_number, preferences } = body;

        if (!account_number) {
            return NextResponse.json({ error: 'account_number is required' }, { status: 400 });
        }

        // Get current pa_preferences for the account
        const { data: currentAccount, error: fetchError } = await supabase
            .from('accounts')
            .select('pa_preferences')
            .eq('account', account_number)
            .single();

        if (fetchError) {
            console.error('Error fetching account:', fetchError);
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        // Merge new preferences with existing ones
        const updatedPreferences = {
            ...(currentAccount?.pa_preferences || {}),
            ...preferences,
        };

        // Update the account's pa_preferences
        const { data, error } = await supabase
            .from('accounts')
            .update({
                pa_preferences: updatedPreferences,
                row_updated: new Date().toISOString(),
            })
            .eq('account', account_number)
            .select('account, pa_preferences')
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to update account preferences' }, { status: 500 });
    }
}
