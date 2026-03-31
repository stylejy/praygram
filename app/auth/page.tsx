'use client';

import { createMembers, getMembers } from '@/apis/members';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Image from 'next/image';

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
      if (localStorage.getItem('group') === 'null') {
        window.location.href = '/join';
        return;
      }
      setTimeout(() => {
        window.location.href = `/${localStorage.getItem('group')}`;
      }, 1500);
    }
  };

  const loginWithKakao = async () => {
    const { error } = await supabaseBrowserClient.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: process.env.NEXT_PUBLIC_AUTH_REDIRECT_TO,
      },
    });

    if (error) {
      console.error('카카오 로그인 에러:', error.message);
    }
  };

  useEffect(() => {
    getAuthUser();
  }, []);

  useEffect(() => {
    processMember();
  }, [authUser]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="animate-fade-in glass-card w-full max-w-sm px-8 py-12 flex flex-col items-center gap-8">
        <h1
          className="text-3xl font-light tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Praygram
        </h1>

        {!authUser && (
          <div className="flex flex-col items-center gap-4 w-full">
            <p
              className="text-sm text-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              같이 기도하는 공간
            </p>
            <button
              onClick={loginWithKakao}
              className="transition-transform active:scale-95"
            >
              <Image
                src="/kakao_login.png"
                alt="카카오 로그인"
                width={280}
                height={65}
                className="rounded-xl"
              />
            </button>
          </div>
        )}

        {authUser && (
          <div className="flex flex-col items-center gap-4">
            <h2
              className="text-2xl font-medium text-center leading-relaxed"
              style={{ color: 'var(--text-primary)' }}
            >
              {authUser?.name}님 <br /> 환영합니다!
            </h2>
            <p
              className="text-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
              잠시 후 홈으로 이동합니다
            </p>
            <div className="spinner mt-2" />
          </div>
        )}
      </div>
    </div>
  );
}
