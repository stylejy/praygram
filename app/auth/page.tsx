'use client';

import { createMembers, getMembers } from '@/apis/members';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

interface AuthUser {
  id: string;
  name: string;
}

export default function AuthPage() {
  const supabaseBrowserClient = createSupabaseBrowserClient();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const getAuthUser = useCallback(async () => {
    try {
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
    } catch (error) {
      console.error('Error getting user:', error);
    }
  }, [supabaseBrowserClient]);

  const saveMember = (member: any) => {
    localStorage.setItem('id', member.id);
    localStorage.setItem('name', member.nickname);
    localStorage.setItem('group', member.group);
    localStorage.setItem('isManager', member.is_manager ? 'true' : 'false');
  };

  const processMember = useCallback(async () => {
    if (authUser === null) {
      return;
    }
    try {
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
    } catch (error) {
      console.error('Error processing member:', error);
    }
  }, [authUser]);

  const loginWithKakao = async () => {
    try {
      const { error } = await supabaseBrowserClient.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo:
            process.env.NEXT_PUBLIC_AUTH_REDIRECT_TO ||
            'http://localhost:3000/auth',
        },
      });

      if (error) {
        console.error('카카오 로그인 에러:', error.message);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  useEffect(() => {
    getAuthUser();
  }, [getAuthUser]);

  useEffect(() => {
    processMember();
  }, [processMember]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Praygram</h1>
          <p className="text-gray-600">기도 모임을 위한 온라인 커뮤니티</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          {authUser ? (
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                안녕하세요, {authUser.name}님!
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-4">로그인 처리 중...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={loginWithKakao}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm bg-yellow-400 text-gray-900 font-medium hover:bg-yellow-500 transition-colors"
              >
                <Image
                  src="/kakao_login.png"
                  alt="카카오 로그인"
                  width={20}
                  height={20}
                  className="mr-3"
                />
                카카오로 시작하기
              </button>
              <p className="text-xs text-gray-500 text-center">
                로그인하여 기도 모임에 참여하세요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
