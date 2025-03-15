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
      setTimeout(() => {
        window.location.href = `/${localStorage.getItem('group')}`;
      }, 1500);
    }
  };

  const loginWithKakao = async () => {
    const { error } = await supabaseBrowserClient.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: process.env.NEXT_PUBLIC_AUTH_REDIRECT_TO, // 기존에 쓰던 redirect URL
      },
    });

    if (error) {
      console.error('카카오 로그인 에러:', error.message);
    }
  };

  useEffect(() => {
    //getAuthUser();
  }, []);

  useEffect(() => {
    //processMember();
  }, [authUser]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 p-16">
      {!authUser && (
        <button onClick={loginWithKakao}>
          <Image
            src="/kakao_login.png"
            alt="카카오 로그인"
            width={300}
            height={70}
          />
        </button>
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
