'use client';

import { useEffect, useState } from 'react';
import Navbar from './navbar';
import Praycard from './parycard';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import { useRealtimePrayers } from '@/hooks/useRealtimePrayers';
import { useRealtimeReactions } from '@/hooks/useRealtimeReactions';

interface Props {
  params: Promise<{ groupId: string }>;
}

export default function GroupHome({ params }: Props) {
  const [groupId, setGroupId] = useState<string>('');
  const [groupName, setGroupName] = useState<string>('로딩 중...');

  // params 해결
  useEffect(() => {
    params.then(({ groupId }) => {
      setGroupId(groupId);
    });
  }, [params]);

  // 실시간 구독 훅 사용
  const { prayers, isLoading, error } = useRealtimePrayers(groupId);
  useRealtimeReactions(groupId);

  // 그룹 정보 가져오기
  useEffect(() => {
    if (!groupId) return;

    const fetchGroupInfo = async () => {
      try {
        const response = await fetch(`/api/groups/${groupId}`);
        if (response.ok) {
          const group = await response.json();
          setGroupName(group.name);
        }
      } catch (error) {
        console.error('그룹 정보 로드 실패:', error);
      }
    };

    fetchGroupInfo();
  }, [groupId]);

  if (!groupId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-red-500">
          데이터를 불러오는 중 오류가 발생했습니다.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-4">
      <header>
        <Navbar groupTitle={groupName} />
      </header>

      <main className="w-full max-w-2xl">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p>기도제목을 불러오는 중...</p>
          </div>
        ) : prayers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              아직 등록된 기도제목이 없습니다.
            </p>
            <p className="text-sm text-gray-400">
              첫 번째 기도제목을 등록해보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {prayers.map((prayer) => (
              <Praycard key={prayer.id} prayer={prayer} />
            ))}
          </div>
        )}
      </main>

      {/* 기도제목 추가 버튼 */}
      <Link
        href={`/${groupId}/add`}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors"
      >
        <FaPlus size={24} />
      </Link>
    </div>
  );
}
