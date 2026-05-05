'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function AuthPage() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  // 기존 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabaseBrowserClient = createSupabaseBrowserClient();
        addDebugLog('기존 세션 확인 중...');
        const {
          data: { session },
        } = await supabaseBrowserClient.auth.getSession();

        if (session?.user) {
          addDebugLog(`기존 세션 발견: ${session.user.email}`);
          setAuthUser({
            id: session.user.id,
            name:
              session.user.user_metadata?.name || session.user.email || 'User',
            email: session.user.email || '',
            avatar: session.user.user_metadata?.avatar_url,
          });
        } else {
          addDebugLog('기존 세션 없음');
        }
      } catch (error) {
        console.error('Session check error:', error);
        addDebugLog(`세션 확인 실패: ${error}`);
      }
    };

    checkSession();
  }, []);

  // URL에서 auth 콜백 처리
  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        addDebugLog('OAuth 콜백 코드 발견, 세션 교환 중...');
        try {
          const supabaseBrowserClient = createSupabaseBrowserClient();
          const { data, error } =
            await supabaseBrowserClient.auth.exchangeCodeForSession(code);
          if (error) throw error;

          if (data.user) {
            addDebugLog(`OAuth 성공: ${data.user.email}`);
            setAuthUser({
              id: data.user.id,
              name: data.user.user_metadata?.name || data.user.email || 'User',
              email: data.user.email || '',
              avatar: data.user.user_metadata?.avatar_url,
            });
          }
        } catch (error) {
          console.error('Auth callback error:', error);
          addDebugLog(`OAuth 콜백 실패: ${error}`);
          setError('로그인 처리 중 오류가 발생했습니다.');
        }
      }
    };

    handleAuthCallback();
  }, []);

  const loginWithKakao = async () => {
    try {
      setError(null);
      addDebugLog('카카오 로그인 시작');
      const supabaseBrowserClient = createSupabaseBrowserClient();

      // 모바일 환경 감지
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      addDebugLog(`모바일 환경: ${isMobile}`);

      const { error } = await supabaseBrowserClient.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          // 모바일에서는 popup 대신 redirect 사용
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Kakao login error:', error);
      addDebugLog(`카카오 로그인 실패: ${error.message || error}`);

      // 환경 변수 에러 처리
      if (error.message?.includes('Missing required environment variables')) {
        setError('서버 설정 오류가 발생했습니다. 관리자에게 문의해주세요.');
        return;
      }

      // 더 구체적인 에러 메시지
      let errorMessage = '카카오 로그인에 실패했습니다.';

      if (error.message?.includes('popup')) {
        errorMessage =
          '팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.';
      } else if (error.message?.includes('network')) {
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else if (error.message?.includes('redirect')) {
        errorMessage =
          '리다이렉트 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message?.includes('cookies')) {
        errorMessage =
          '쿠키 설정을 확인해주세요. 브라우저에서 쿠키를 허용해야 합니다.';
      }

      setError(errorMessage + ' 다시 시도해주세요.');
    }
  };

  // 인증된 사용자 처리
  useEffect(() => {
    if (!authUser || isProcessing) return;

    const processMember = async () => {
      try {
        setIsProcessing(true);
        addDebugLog('멤버 처리 시작...');

        // localStorage에 저장
        localStorage.setItem('id', authUser.id);
        localStorage.setItem('nickname', authUser.name);

        // 초대 링크 처리 - 로그인 완료 즉시 그룹 참여
        const pendingInviteGroupId = localStorage.getItem(
          'pendingInviteGroupId'
        );

        if (pendingInviteGroupId) {
          // 초대 링크에서 온 경우 - 즉시 그룹 참여 처리
          addDebugLog(`초대 그룹 자동 참여 시작: ${pendingInviteGroupId}`);

          try {
            // joinGroup import 필요
            const { joinGroup } = await import('@/apis/members');
            await joinGroup(pendingInviteGroupId, authUser.id);

            // 초대 관련 정보 정리
            localStorage.removeItem('pendingInviteGroupId');
            sessionStorage.removeItem('redirectAfterAuth');

            addDebugLog(
              `그룹 참여 완료, 그룹방으로 이동: ${pendingInviteGroupId}`
            );
            router.push(`/${pendingInviteGroupId}`);
            return;
          } catch (error) {
            console.error('자동 그룹 참여 실패:', error);
            addDebugLog(`자동 그룹 참여 실패: ${error}`);

            // 실패 시 일반 초대 페이지로 이동
            router.push(`/join/${pendingInviteGroupId}`);
            return;
          }
        }

        // 일반 리다이렉트 처리
        const redirectUrl = sessionStorage.getItem('redirectAfterAuth');
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterAuth');
          addDebugLog(`일반 리다이렉트: ${redirectUrl}`);
          router.push(redirectUrl);
        } else {
          // 기본: 그룹 선택 페이지로 리다이렉션
          addDebugLog('그룹 선택 페이지로 이동');
          router.push('/groups');
        }
      } catch (error) {
        console.error('Error processing member:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : '처리 중 오류가 발생했습니다.';
        addDebugLog(`멤버 처리 실패: ${errorMessage}`);
        setError(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    };

    processMember();
  }, [authUser, isProcessing, router]);

  return (
    <main className="page-shell flex items-center justify-center">
      <section className="content-panel max-w-md px-7 py-10 fade-in">
        <div className="mb-8">
          <p className="section-eyebrow text-center">같이 기도하는 공간</p>
          <h1 className="mt-2 text-center text-3xl font-semibold tracking-tight text-[color:var(--text-primary)]">
            Praygram
          </h1>
        </div>

        {authUser ? (
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-center text-xl font-semibold leading-relaxed text-[color:var(--text-primary)]">
              {authUser.name}님 <br /> 환영합니다!
            </h2>
            <p className="text-sm text-[color:var(--text-muted)]">
              잠시 후 이동합니다
            </p>
            <LoadingSpinner />
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-4">
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50/80 px-4 py-3 text-center text-sm leading-relaxed text-red-600">
                {error}{' '}
                <button
                  onClick={() => {
                    setError(null);
                    setDebugLog([]);
                  }}
                  className="font-semibold underline"
                >
                  다시 시도
                </button>
              </p>
            )}

            <button
              onClick={loginWithKakao}
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-3 rounded-lg px-6 py-3.5 font-semibold text-gray-900 transition-transform active:scale-[0.99] disabled:opacity-50"
              style={{ background: '#FEE500' }}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner />
                  <span>로그인 중...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3C7.03 3 3 6.58 3 10.95c0 2.84 1.88 5.34 4.68 6.84l-.9 3.3c-.08.3.22.53.49.38L10.9 19c.36.03.73.05 1.1.05 4.97 0 9-3.58 9-7.95S16.97 3 12 3z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>카카오로 시작하기</span>
                </>
              )}
            </button>
            <p className="mt-2 text-center text-xs leading-5 text-[color:var(--text-muted)]">
              로그인 후 참여한 기도모임과 초대 링크를 이어서 확인할 수 있어요.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
