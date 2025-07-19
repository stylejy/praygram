import { createBrowserClient } from '@supabase/ssr';

export const createSupabaseBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
        'Please set these variables in your deployment environment.'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
};
