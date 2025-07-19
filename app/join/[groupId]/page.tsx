'use client';
import { usePathname, useRouter } from 'next/navigation';
import { joinGroup } from '@/apis/members';
import { useEffect, useCallback } from 'react';

export default function JoinGroup() {
  const pathname = usePathname();
  const router = useRouter();

  const processJoin = useCallback(
    async (groupId: string) => {
      if (localStorage.getItem('id') === null) {
        window.location.href = '/auth';
        return;
      }
      try {
        const response = await joinGroup(groupId, localStorage.getItem('id')!);
        if (response) {
          setTimeout(() => {
            router.push(`/${groupId}`);
          }, 1500);
        }
      } catch (error) {
        if ((error as any).details?.includes('Key is not present in table')) {
          alert('기도모임 아이디가 존재하지 않습니다! 다시한번 확인해 주세요!');
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          그룹 가입 중...
        </h1>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
