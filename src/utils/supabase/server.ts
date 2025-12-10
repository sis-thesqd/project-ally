import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Server client for API routes and server components (reads cookies for auth)
export async function createServerSupabase() {
    const cookieStore = await cookies();
    
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => 
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Called from Server Component - ignore
                    }
                },
            },
        }
    );
}

// Read-only client for RPC calls (no auth needed)
export const supabaseReadOnly = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_READ_ONLY!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


