import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/utils/supabase/server';
import { getInitData } from '@/lib/data/init-data';
import { InitDataProvider } from '@/contexts/InitDataContext';
import { AppLayoutClient } from './layout-client';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createServerSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();

    // Server-side auth check - redirect before any client code runs
    if (error || !user?.email) {
        redirect('/login');
    }

    // Fetch init data on server for all authenticated routes
    console.log('[App Layout] Fetching init data for email:', user.email);
    const initDataResult = await getInitData(user.email);
    console.log('[App Layout] Init data result:', initDataResult.data ? 'Data received' : 'No data', initDataResult.error);

    return (
        <InitDataProvider initialData={initDataResult.data}>
            <AppLayoutClient>{children}</AppLayoutClient>
        </InitDataProvider>
    );
}
