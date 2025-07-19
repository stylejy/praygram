'use client';

import { createMembers, getMembers } from '@/apis/members';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

interface AuthUser {
  id: string;
  name: string;
}

export default function AuthPage() {
  const router = useRouter();
  const supabaseBrowserClient = createSupabaseBrowserClient();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addDebugLog = (message: string) => {
    console.log('[AUTH DEBUG]', message);
    setDebugLog((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const getAuthUser = useCallback(async () => {
    try {
      addDebugLog('인증 사용자 확인 시작');
      const { data } = await supabaseBrowserClient.auth.getUser();
      addDebugLog(
        `사용자 데이터: ${JSON.stringify(
          data?.user?.id
            ? { id: data.user.id, hasMetadata: !!data.user.user_metadata }
            : 'null'
        )}`
      );

      const [id, name] = [
        data?.user?.id,
        data?.user?.user_metadata.preferred_username ||
          data?.user?.user_metadata.name ||
          data?.user?.user_metadata.full_name,
      ];

      addDebugLog(`추출된 정보 - ID: ${id}, Name: ${name}`);

      if (!id || !name) {
        addDebugLog('ID 또는 이름이 없음');
        return;
      }
      setAuthUser({
        id,
        name,
      });
      addDebugLog('AuthUser 설정 완료');
    } catch (error) {
      console.error('Error getting user:', error);
      addDebugLog(`사용자 정보 가져오기 실패: ${error}`);
      setError('사용자 정보를 가져오는데 실패했습니다.');
    }
  }, [supabaseBrowserClient]);

  const saveMember = (member: any) => {
    addDebugLog(`멤버 정보 저장: ${JSON.stringify(member)}`);
    localStorage.setItem('id', member.id);
    localStorage.setItem('name', member.nickname);
    localStorage.setItem('group', member.group || 'null');
    localStorage.setItem('isManager', member.is_manager ? 'true' : 'false');
  };

  const processMember = useCallback(async () => {
    if (!authUser || isProcessing) {
      addDebugLog(
        `멤버 처리 건너뜀 - authUser: ${!!authUser}, isProcessing: ${isProcessing}`
      );
      return;
    }

    addDebugLog('멤버 처리 시작');
    setIsProcessing(true);
    setError(null);

    try {
      // 기존 멤버 정보 확인
      addDebugLog('기존 멤버 정보 확인 중...');
      const members = await getMembers(authUser.id);
      addDebugLog(
        `멤버 조회 결과: ${members ? JSON.stringify(members) : 'null'}`
      );

      if (members === null) {
        throw new Error('멤버 정보를 가져오는데 실패했습니다.');
      }

      let memberData;

      if (members.length === 0) {
        // 새 멤버 생성
        addDebugLog('새 멤버 생성 중...');
        const response = await createMembers(authUser.name);
        addDebugLog(
          `멤버 생성 결과: ${response ? JSON.stringify(response) : 'null'}`
        );

        if (!response || response.length === 0) {
          throw new Error('멤버 생성에 실패했습니다.');
        }
        memberData = response[0];
      } else {
        memberData = members[0];
      }

      // localStorage에 저장
      saveMember(memberData);

      // 그룹 참여 여부에 따라 리디렉션
      addDebugLog(`리디렉션 준비 - 그룹: ${memberData.group}`);

      if (!memberData.group || memberData.group === 'null') {
        addDebugLog('그룹 참여 페이지로 이동');
        router.push('/join');
      } else {
        addDebugLog(`그룹 홈으로 이동: ${memberData.group}`);
        router.push(`/${memberData.group}`);
      }
    } catch (error) {
      console.error('Error processing member:', error);
      const errorMessage =
        error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.';
      addDebugLog(`멤버 처리 실패: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [authUser, isProcessing, router]);

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
        console.error('카카오 로그인 에러:', error.message);
        addDebugLog(`카카오 로그인 에러: ${error.message}`);
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
      } else {
        addDebugLog('카카오 로그인 요청 성공');
      }
    } catch (error) {
      console.error('Login error:', error);
      addDebugLog(`로그인 예외: ${error}`);
      setError('로그인 중 오류가 발생했습니다.');
    }
  };

  // 인증 상태 확인
  useEffect(() => {
    addDebugLog('컴포넌트 마운트됨');
    getAuthUser();
  }, [getAuthUser]);

  // 멤버 처리 (authUser가 설정된 후)
  useEffect(() => {
    if (authUser && !isProcessing) {
      processMember();
    }
  }, [authUser, processMember, isProcessing]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Praygram</h1>
          <p className="text-gray-600">기도 모임을 위한 온라인 커뮤니티</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          {/* 디버그 로그 (개발 모드에서만) */}
          {process.env.NODE_ENV === 'development' && debugLog.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 border rounded-md text-xs">
              <details>
                <summary className="cursor-pointer font-medium">
                  디버그 로그
                </summary>
                <div className="mt-2 space-y-1">
                  {debugLog.slice(-10).map((log, index) => (
                    <div key={index} className="text-gray-600">
                      {log}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setDebugLog([]);
                }}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                다시 시도
              </button>
            </div>
          )}

          {authUser ? (
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                안녕하세요, {authUser.name}님!
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-4">
                {isProcessing ? '계정 설정 중...' : '로그인 처리 중...'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={loginWithKakao}
                disabled={isProcessing}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm bg-yellow-400 text-gray-900 font-medium hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner className="w-5 h-5 mr-3" />
                    <span>로그인 중...</span>
                  </>
                ) : (
                  <>
                    <Image
                      src="/kakao_login.png"
                      alt="카카오 로그인"
                      width={20}
                      height={20}
                      className="mr-3"
                    />
                    <span>카카오로 시작하기</span>
                  </>
                )}
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
