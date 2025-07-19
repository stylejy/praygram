'use client';
import { usePathname, useRouter } from 'next/navigation';
import { joinGroup } from '@/apis/members';
import { useEffect, useCallback, useState } from 'react';
import { PraygramLogo } from '@/app/components/PraygramLogo';
import { createSupabaseBrowserClient } from '@/lib/supabase';

export default function JoinGroup() {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<
    'checking' | 'joining' | 'redirecting' | 'error'
  >('checking');
  const [errorMessage, setErrorMessage] = useState('');

  const processJoin = useCallback(
    async (groupId: string) => {
      setStatus('checking');

      // Supabase Auth에서 현재 사용자 확인
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        // 로그인되지 않은 경우
        localStorage.setItem('pendingInviteGroupId', groupId);
        sessionStorage.setItem('redirectAfterAuth', `/join/${groupId}`);
        window.location.href = '/auth';
        return;
      }

      // 이미 로그인된 경우 - 바로 그룹 참여 처리

      // localStorage에 사용자 정보 업데이트
      localStorage.setItem('id', user.id);
      localStorage.setItem(
        'nickname',
        user.user_metadata?.name || user.email || 'User'
      );

      setStatus('joining');

      try {
        const response = await joinGroup(groupId, user.id);
        if (response) {
          // 초대 관련 정보 정리
          localStorage.removeItem('pendingInviteGroupId');
          sessionStorage.removeItem('redirectAfterAuth');

          setStatus('redirecting');

          // 이미 그룹에 속해있는 경우 즉시 이동
          router.push(`/${groupId}`);
        }
      } catch (error) {
        console.error('그룹 참여 실패:', error);
        setStatus('error');

        const errorMessage =
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.';

        if (errorMessage.includes('존재하지 않는 기도모임')) {
          setErrorMessage(
            '존재하지 않는 기도모임입니다. 초대 링크를 다시 확인해주세요.'
          );
        } else if (errorMessage.includes('사용자 정보를 찾을 수 없습니다')) {
          setErrorMessage('로그인 정보가 만료되었습니다. 다시 로그인해주세요.');
        } else {
          setErrorMessage(errorMessage);
        }
      }
    },
    [router]
  );

  useEffect(() => {
    const groupId = pathname.split('/')[2];
    if (groupId) {
      processJoin(groupId);
    }
  }, [pathname, processJoin]);

  const getStatusContent = () => {
    switch (status) {
      case 'checking':
        return {
          icon: <PraygramLogo size="lg" className="mb-6" />,
          title: '로그인 확인 중...',
          description: '카카오 로그인 페이지로 이동합니다',
          showSpinner: true,
        };
      case 'joining':
        return {
          icon: <PraygramLogo size="lg" className="mb-6" />,
          title: '기도모임 참여 중...',
          description: '잠시만 기다려주세요',
          showSpinner: true,
        };
      case 'redirecting':
        return {
          icon: (
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
          ),
          title: '참여 완료! 🎉',
          description: '기도모임으로 이동합니다',
          showSpinner: false,
        };
      case 'error':
        return {
          icon: (
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          ),
          title: '참여 실패',
          description: errorMessage,
          showSpinner: false,
        };
      default:
        return {
          icon: <PraygramLogo size="lg" className="mb-6" />,
          title: '처리 중...',
          description: '잠시만 기다려주세요',
          showSpinner: true,
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 rounded-3xl text-center slide-up">
          {content.icon}

          {content.showSpinner && (
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {content.title}
          </h1>
          <p className="text-gray-600 mb-6">{content.description}</p>

          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={() => {
                  const groupId = pathname.split('/')[2];
                  setStatus('checking');
                  setErrorMessage('');
                  processJoin(groupId);
                }}
                className="primary-button w-full py-3 px-4 rounded-xl font-semibold text-white hover:scale-105 transition-all duration-200"
              >
                다시 시도
              </button>
              <button
                onClick={() => router.push('/groups')}
                className="glass-button w-full py-3 px-4 rounded-xl font-medium text-gray-700 hover:scale-105 transition-all duration-200"
              >
                기도모임 목록으로
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
