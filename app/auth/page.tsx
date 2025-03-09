'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeMinimal } from '@supabase/auth-ui-shared';

export default function AuthPage() {
  const supabaseBrowserClient = createSupabaseBrowserClient();
  return (
    <div>
      <Auth
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
