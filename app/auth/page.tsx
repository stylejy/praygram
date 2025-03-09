'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeMinimal } from '@supabase/auth-ui-shared';

export default function AuthPage() {
  const supabaseBrowserClient = createSupabaseBrowserClient();
  return (
    <div>
      <Auth
        redirectTo={process.env.NEXT_PUBLIC_AUTH_REDIRECT_TO}
        supabaseClient={supabaseBrowserClient}
        appearance={{
          theme: ThemeMinimal,
        }}
        onlyThirdPartyProviders
        providers={['kakao']}
      />
    </div>
  );
}
