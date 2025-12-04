import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/utils/supabase/server';
import { AppLayoutClient } from './layout-client';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createServerSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();

    // Server-side auth check - redirect before any client code runs
    if (error || !user) {
        redirect('/login');
    }

    return <AppLayoutClient>{children}</AppLayoutClient>;
}
