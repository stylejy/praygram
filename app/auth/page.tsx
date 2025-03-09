'use client';

import { createMembers, getMembers } from '@/apis/members';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeMinimal } from '@supabase/auth-ui-shared';
import { useEffect, useState } from 'react';

export default function AuthPage() {
  const supabaseBrowserClient = createSupabaseBrowserClient();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const getAuthUser = async () => {
    const { data } = await supabaseBrowserClient.auth.getUser();
    const [id, name] = [
      data?.user?.id,
      data?.user?.user_metadata.preferred_username,
    ];
    if (!id || !name) {
      return;
    }
    setAuthUser({
      id,
      name,
    });
  };

  const saveMember = (member: any) => {
    localStorage.setItem('id', member.id);
    localStorage.setItem('name', member.nickname);
    localStorage.setItem('group', member.group);
    localStorage.setItem('isManager', member.is_manager ? 'true' : 'false');
  };

  const processMember = async () => {
    if (authUser === null) {
      return;
    }
    const members = await getMembers(authUser.id);
    if (members && members.length === 0) {
      const response = await createMembers(authUser.name);
      response && saveMember(response[0]);
    } else {
      members && saveMember(members[0]);
    }

    if (authUser) {
      setTimeout(() => {
        window.location.href = `/${localStorage.getItem('group')}`;
      }, 1500);
    }
  };

  useEffect(() => {
    getAuthUser();
  }, []);

  useEffect(() => {
    processMember();
  }, [authUser]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      {!authUser && (
        <Auth
          redirectTo={process.env.NEXT_PUBLIC_AUTH_REDIRECT_TO}
          supabaseClient={supabaseBrowserClient}
          appearance={{
            theme: ThemeMinimal,
          }}
          onlyThirdPartyProviders
          providers={['kakao']}
        />
      )}
      {authUser && (
        <>
          <h1 className="text-3xl font-bold text-center">
            {authUser?.name}님 <br /> 환영합니다!
          </h1>
          <p>잠시 후 홈으로 이동합니다</p>
        </>
      )}
    </div>
  );
}
