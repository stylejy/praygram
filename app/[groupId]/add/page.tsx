'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createPrayer } from '@/apis/prayers';
import { mutate } from 'swr';
import { saveOfflinePrayer, isOnline } from '@/lib/offlineStorage';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

interface Props {
  params: Promise<{ groupId: string }>;
}

export default function AddPrayer({ params }: Props) {
  const router = useRouter();
  const [groupId, setGroupId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // params 해결
  useEffect(() => {
    params.then(({ groupId }) => {
      setGroupId(groupId);
    });
  }, [params]);

  // 온라인/오프라인 상태 모니터링
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOfflineMode(!isOnline());
    };

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    if (!groupId) {
      alert('그룹 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsSubmitting(true);

    const prayerData = {
      group_id: groupId,
      title: title.trim(),
      content: content.trim(),
    };

    try {
      if (isOfflineMode) {
        // 오프라인 모드: localStorage에 저장
        saveOfflinePrayer(prayerData);

        // SWR 캐시 업데이트 (오프라인 데이터 포함)
        mutate(`/api/prayers?groupId=${groupId}`);

        alert(
          '오프라인 상태입니다. 기도제목이 임시 저장되었으며, 온라인 복구 시 자동으로 동기화됩니다.'
        );
      } else {
        // 온라인 모드: API 호출
        await createPrayer(prayerData);

        // SWR 캐시 업데이트
        mutate(`/api/prayers?groupId=${groupId}`);
      }

      // 성공 시 그룹 홈으로 이동
      router.push(`/${groupId}`);
    } catch (error) {
      console.error('기도제목 등록 실패:', error);

      if (isOfflineMode) {
        alert('오프라인 저장에 실패했습니다. 다시 시도해주세요.');
      } else {
        // 온라인이지만 API 실패 시 오프라인으로 저장
        try {
          saveOfflinePrayer(prayerData);
          alert(
            '서버 연결에 실패했습니다. 기도제목이 임시 저장되었으며, 나중에 자동으로 동기화됩니다.'
          );
          router.push(`/${groupId}`);
        } catch (offlineError) {
          alert('기도제목 등록에 실패했습니다. 다시 시도해주세요.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!groupId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">
            기도제목 등록
            {isOfflineMode && (
              <span className="ml-2 text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">
                오프라인
              </span>
            )}
          </h1>
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {isOfflineMode && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <p className="text-sm text-orange-800">
              현재 오프라인 상태입니다. 기도제목이 임시 저장되며, 온라인 복구 시
              자동으로 동기화됩니다.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              제목
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="기도제목을 간단히 입력해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={100}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              내용
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="기도제목에 대한 자세한 내용을 입력해주세요"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">{content.length}/500</p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isSubmitting || !title.trim() || !content.trim()}
            >
              {isSubmitting && <LoadingSpinner />}
              {isSubmitting
                ? '처리 중...'
                : isOfflineMode
                ? '임시 저장'
                : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
