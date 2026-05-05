'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPrayer } from '@/apis/prayers';
import { mutate } from 'swr';
import { saveOfflinePrayer, isOnline } from '@/lib/offlineStorage';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { FaChevronLeft } from 'react-icons/fa';

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
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="quiet-header fixed inset-x-0 top-0 z-50">
        <div className="relative mx-auto flex h-[72px] w-full max-w-xl items-center px-4 md:px-0">
          <button
            onClick={() => router.back()}
            className="quiet-icon-button absolute left-[4.5px] top-1/2 shrink-0 -translate-y-1/2 md:-left-[14px]"
            aria-label="기도목록으로 이동"
          >
            <FaChevronLeft size={13} />
          </button>
          <div className="ml-12 min-w-0 flex-1">
            <p className="section-eyebrow">기도제목</p>
            <h1 className="truncate text-[17px] font-semibold leading-6 text-[color:var(--text-primary)]">
              새 기도제목 등록
            </h1>
          </div>
          {isOfflineMode && (
            <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-600">
              오프라인
            </span>
          )}
        </div>
      </nav>

      <main className="px-4 pb-10 pt-24">
        <form
          onSubmit={handleSubmit}
          className="content-panel max-w-xl space-y-5 fade-in"
        >
          <div>
            <p className="section-eyebrow">기도 요청</p>
            <h2 className="mt-1 text-xl font-semibold text-[color:var(--text-primary)]">
              함께 나눌 기도제목을 적어주세요
            </h2>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="field-label">
              이름
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="glass-input w-full rounded-lg px-4 py-3 text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)]"
              maxLength={50}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="field-label">
              기도제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="기도제목을 입력하세요"
              className="glass-input w-full rounded-lg px-4 py-3 text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)]"
              maxLength={100}
              disabled={isSubmitting}
              required
            />
            <span className="text-right text-xs text-[color:var(--text-muted)]">
              {title.length}/100
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="field-label">
              상세 내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="구체적인 기도 요청사항을 작성해주세요"
              className="glass-input w-full resize-none rounded-lg px-4 py-3 text-sm leading-6 text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)]"
              rows={5}
              maxLength={500}
              disabled={isSubmitting}
              required
            />
            <span className="text-right text-xs text-[color:var(--text-muted)]">
              {content.length}/500
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="glass-button flex-1 rounded-lg py-3 text-sm font-medium text-[color:var(--text-secondary)] disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim() || !authorName.trim()}
              className="primary-button flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {isSubmitting && <LoadingSpinner />}
              {isSubmitting ? '등록 중...' : isOfflineMode ? '임시 저장' : '등록하기'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
