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
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // params 해결
  useEffect(() => {
    params.then(({ groupId }) => {
      setGroupId(groupId);
    });
  }, [params]);

  // localStorage에서 저장된 이름 불러오기
  useEffect(() => {
    const savedName = localStorage.getItem('prayerAuthorName');
    if (savedName) {
      setAuthorName(savedName);
    }
  }, []);

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

    if (!title.trim() || !content.trim() || !authorName.trim()) {
      alert('이름, 제목, 내용을 모두 입력해주세요.');
      return;
    }

    if (!groupId) {
      alert('그룹 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsSubmitting(true);

    // 이름을 localStorage에 저장
    localStorage.setItem('prayerAuthorName', authorName.trim());

    const prayerData = {
      group_id: groupId,
      title: title.trim(),
      content: content.trim(),
      author_name: authorName.trim(),
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

      // 성공 시 이전 페이지로 이동
      router.back();
    } catch (error) {
      console.error('기도제목 등록 실패:', error);

      if (!isOfflineMode) {
        // 온라인이지만 실패한 경우 오프라인으로 처리
        try {
          saveOfflinePrayer(prayerData);
          mutate(`/api/prayers?groupId=${groupId}`);
          alert(
            '네트워크 오류로 임시 저장되었습니다. 온라인 복구 시 자동으로 동기화됩니다.'
          );
          router.back();
        } catch (offlineError) {
          alert('기도제목 등록에 실패했습니다. 다시 시도해주세요.');
        }
      } else {
        alert('오프라인 상태에서 저장에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!groupId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-3xl text-center slide-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <LoadingSpinner />
          </div>
          <p className="text-gray-600 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg border border-white/50">
            <svg
              className="w-8 h-8 text-gray-700"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            새 기도제목 등록
            {isOfflineMode && (
              <span className="ml-3 inline-flex items-center px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800 rounded-full">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                오프라인
              </span>
            )}
          </h1>
          <p className="text-gray-600">마음을 담아 기도제목을 작성해보세요</p>
        </div>

        {/* Offline Notice */}
        {isOfflineMode && (
          <div className="mb-6 p-4 rounded-2xl bg-orange-50/80 border border-orange-200/50 slide-up">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-white text-sm">⚠️</span>
              </div>
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">
                  오프라인 모드
                </h3>
                <p className="text-sm text-orange-800">
                  현재 오프라인 상태입니다. 기도제목이 임시 저장되며, 온라인
                  복구 시 자동으로 동기화됩니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="glass-card p-8 rounded-3xl slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                이름 *
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="glass-input w-full px-4 py-3 rounded-xl text-gray-900 font-medium placeholder-gray-500"
                maxLength={50}
                disabled={isSubmitting}
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                한 번 입력하면 다음에도 자동으로 입력됩니다
              </p>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                기도제목 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="기도제목을 입력하세요 (최대 100자)"
                className="glass-input w-full px-4 py-3 rounded-xl text-gray-900 font-medium placeholder-gray-500"
                maxLength={100}
                disabled={isSubmitting}
                required
              />
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  간단하고 명확하게 작성해주세요
                </p>
                <span className="text-xs text-gray-400">
                  {title.length}/100
                </span>
              </div>
            </div>

            {/* Content Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                상세 내용 *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="구체적인 기도 요청사항을 작성해주세요 (최대 500자)"
                className="glass-input w-full px-4 py-4 rounded-xl text-gray-900 resize-none font-medium placeholder-gray-500"
                rows={6}
                maxLength={500}
                disabled={isSubmitting}
                required
              />
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  기도가 필요한 상황을 자세히 설명해주세요
                </p>
                <span className="text-xs text-gray-400">
                  {content.length}/500
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="glass-button flex-1 py-3 px-4 rounded-xl font-semibold text-gray-700 hover:scale-105 transition-all duration-200 disabled:opacity-50"
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                type="submit"
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
                  isOfflineMode
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg hover:shadow-xl'
                    : 'primary-button hover:scale-105'
                }`}
                disabled={isSubmitting || !title.trim() || !content.trim()}
              >
                {isSubmitting && <LoadingSpinner />}
                <span>
                  {isSubmitting
                    ? '등록 중...'
                    : isOfflineMode
                    ? '임시 저장'
                    : '등록하기'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-8 p-6 rounded-2xl bg-blue-50/80 border border-blue-200/50 fade-in">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <span className="text-lg mr-2">💡</span>
            기도제목 작성 팁
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              구체적이고 명확한 상황을 설명해주세요
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              개인정보는 적절히 보호하면서 작성해주세요
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              감사나 찬양의 내용도 함께 나누어보세요
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
