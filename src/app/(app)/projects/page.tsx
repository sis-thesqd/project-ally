import { createServerSupabase, supabaseReadOnly } from '@/utils/supabase/server';
import { getMMQData } from '@/lib/data/mmq';
import { ProjectsClient } from './projects-client';

// Server component - fetches data before render
export default async function ProjectsPage() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
        return null; // Layout handles redirect
    }

    // Get user preferences to determine default account
    const { data: initData, error: rpcError } = await supabaseReadOnly.rpc('pa_init_data', { input_email: user.email }, { get: true });
    console.log('[Server] RPC response:', {
        hasData: !!initData,
        error: rpcError,
        dataType: typeof initData,
        keys: initData ? Object.keys(initData) : []
    });

    const preferences = initData?.preferences;
    const accounts = initData?.accounts;
    const defaultAccount = preferences?.default_account ?? accounts?.[0]?.account_number;

    console.log('[Server] Account resolution:', {
        hasPreferences: !!preferences,
        defaultFromPrefs: preferences?.default_account,
        hasAccounts: !!accounts,
        accountsLength: accounts?.length,
        firstAccount: accounts?.[0]?.account_number,
        finalDefault: defaultAccount
    });

    // Prefetch MMQ data on server for default account
    let initialMMQData = null;
    if (defaultAccount) {
        console.log('[Server] Fetching MMQ data for account:', defaultAccount);
        const mmqResult = await getMMQData(defaultAccount);
        console.log('[Server] MMQ result:', mmqResult.data ? 'Data received' : 'No data', mmqResult.error);
        initialMMQData = mmqResult.data;
    } else {
        console.log('[Server] No default account found');
    }

    console.log('[Server] Rendering ProjectsClient with initialData:', initialMMQData ? 'Data provided' : 'No data');

    return (
        <ProjectsClient
            initialMMQData={initialMMQData}
            serverDefaultAccount={defaultAccount}
        />
    );
}
