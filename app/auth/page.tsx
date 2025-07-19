'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { PraygramLogo } from '@/app/components/PraygramLogo';

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

  const supabaseBrowserClient = createSupabaseBrowserClient();

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  // 기존 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
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

        // 리다이렉트 URL 확인 (초대 링크에서 온 경우)
        const redirectUrl = sessionStorage.getItem('redirectAfterAuth');
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterAuth');
          addDebugLog(`초대 링크로 리다이렉트: ${redirectUrl}`);
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <PraygramLogo size="xl" className="mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Praygram</h1>
          <p className="text-lg text-gray-600">
            기도 모임을 위한 온라인 커뮤니티
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl">
          {/* Debug Log (Development Only) */}
          {process.env.NODE_ENV === 'development' && debugLog.length > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-gray-50/80 border border-gray-200/50">
              <details>
                <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                  디버그 로그
                </summary>
                <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
                  {debugLog.slice(-10).map((log, index) => (
                    <div
                      key={index}
                      className="text-xs text-gray-600 font-mono"
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50/80 border border-red-200/50">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-sm">⚠️</span>
                </div>
                <div className="flex-1">
                  <p className="text-red-800 font-medium mb-2">{error}</p>

                  {/* 모바일 크롬 사용자를 위한 추가 안내 */}
                  <div className="text-sm text-red-700 space-y-1">
                    <p className="font-medium">모바일에서 문제가 발생한다면:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>
                        크롬 설정 → 고급 → 사이트 설정 → 쿠키에서 '모든 쿠키
                        허용'
                      </li>
                      <li>
                        크롬 설정 → 고급 → 사이트 설정 → 팝업 및 리디렉션 허용
                      </li>
                      <li>시크릿 모드에서 시도해보기</li>
                      <li>브라우저 캐시 및 쿠키 삭제 후 재시도</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      setError(null);
                      setDebugLog([]);
                    }}
                    className="mt-3 text-sm text-red-600 hover:text-red-800 underline font-medium"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Auth Content */}
          {authUser ? (
            <div className="text-center slide-up">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                안녕하세요, {authUser.name}님!
              </h3>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <LoadingSpinner />
                <span className="text-gray-600 font-medium">
                  {isProcessing ? '계정 설정 중...' : '로그인 처리 중...'}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={loginWithKakao}
                disabled={isProcessing}
                className="w-full glass-button flex items-center justify-center px-6 py-4 rounded-2xl font-semibold text-gray-900 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #FEE500, #FFEB3B)',
                  border: '1px solid rgba(254, 229, 0, 0.3)',
                }}
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-3">로그인 중...</span>
                  </>
                ) : (
                  <>
                    {/* Kakao Talk Symbol */}
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="mr-3"
                    >
                      <path
                        d="M12 3C7.03 3 3 6.58 3 10.95c0 2.84 1.88 5.34 4.68 6.84l-.9 3.3c-.08.3.22.53.49.38L10.9 19c.36.03.73.05 1.1.05 4.97 0 9-3.58 9-7.95S16.97 3 12 3z"
                        fill="currentColor"
                      />
                    </svg>
                    <span>카카오로 시작하기</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  로그인하여 기도 모임에 참여하세요
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            함께 기도하고, 서로 격려하는 온라인 기도 공간
          </p>
        </div>
      </div>
    </div>
  );
}
