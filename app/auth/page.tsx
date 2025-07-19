'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import Image from 'next/image';
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

      const { error } = await supabaseBrowserClient.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Kakao login error:', error);
      addDebugLog(`카카오 로그인 실패: ${error}`);
      setError('카카오 로그인에 실패했습니다. 다시 시도해주세요.');
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
                  <p className="text-red-800 font-medium">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      setDebugLog([]);
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline font-medium"
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
                    <Image
                      src="/kakao_login.png"
                      alt="카카오 로그인"
                      width={24}
                      height={24}
                      className="mr-3"
                    />
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
