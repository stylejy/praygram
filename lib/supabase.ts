import { createBrowserClient } from '@supabase/ssr';

export const createSupabaseBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      'Supabase environment variables are not set. Using mock client.'
    );
    // 개발 환경에서 환경 변수가 없을 때 mock 클라이언트 반환
    return {
      auth: {
        getUser: () =>
          Promise.resolve({
            data: { user: null },
            error: new Error('No env vars'),
          }),
        getSession: () =>
          Promise.resolve({
            data: { session: null },
            error: new Error('No env vars'),
          }),
        signInWithOAuth: () =>
          Promise.resolve({ error: new Error('No env vars') }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({ data: null, error: new Error('No env vars') }),
          }),
        }),
        insert: () => ({
          select: () =>
            Promise.resolve({ data: null, error: new Error('No env vars') }),
        }),
        update: () => ({
          eq: () => ({
            select: () =>
              Promise.resolve({ data: null, error: new Error('No env vars') }),
          }),
        }),
      }),
    } as any;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
};
