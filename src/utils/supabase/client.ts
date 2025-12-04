import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// Browser client for client-side auth (handles cookies automatically)
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Read-only client for RPC calls (no auth needed)
export const supabaseReadOnly = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_READ_ONLY!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
