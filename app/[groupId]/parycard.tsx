'use client';

import { useState, useEffect } from 'react';
import { addReaction } from '@/apis/reactions';
import { getFormattedTime } from '@/lib/timeFormatter';
import { queueOfflineAction, isOnline } from '@/lib/offlineStorage';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { PrayerWithReactions } from '@/types/prayer';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { FaRegHeart } from 'react-icons/fa';

interface Props {
  prayer: PrayerWithReactions & { is_offline?: boolean };
}

export default function Praycard(props: Props) {
  const { prayer } = props;
  const [isReacting, setIsReacting] = useState(false);
  const [reactionCount, setReactionCount] = useState(
    prayer.reaction_count || 0
  );

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isMyPrayer, setIsMyPrayer] = useState(false);
  const [hasEverPrayed, setHasEverPrayed] = useState(false);
  const [showPrayEffect, setShowPrayEffect] = useState(false);

  // 현재 사용자 ID 가져오기 (Supabase Auth에서)
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!error && user) {
          setCurrentUserId(user.id);

          // 디버깅을 위한 로그
          console.log('=== Prayer Card Debug ===');
          console.log('Prayer ID:', prayer.id);
          console.log('Prayer Title:', prayer.title);
          console.log('Current User ID (from Supabase):', user.id);
          console.log('Prayer Author ID:', prayer.author_id);
          console.log('Is My Prayer:', user.id === prayer.author_id);
          console.log('========================');

          // 내 기도 카드인지 확인
          setIsMyPrayer(user.id === prayer.author_id);
        } else {
          console.error('사용자 정보를 가져올 수 없습니다:', error);
          setCurrentUserId(null);
          setIsMyPrayer(false);
        }
      } catch (error) {
        console.error('Auth 확인 중 오류:', error);
        setCurrentUserId(null);
        setIsMyPrayer(false);
      }
    };

    getCurrentUser();
  }, [prayer.reactions, prayer.author_id, prayer.id, prayer.title]);

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

  const handleReactionClick = async () => {
    if (isReacting || prayer.is_offline) return;

    try {
      setIsReacting(true);

      // 기도 이펙트 표시
      setShowPrayEffect(true);
      setTimeout(() => setShowPrayEffect(false), 2000);

      // 항상 기도 추가 (토글하지 않음)
      if (isOfflineMode) {
        queueOfflineAction({
          type: 'ADD_REACTION',
          data: { prayer_id: prayer.id, type: 'pray' },
          groupId: prayer.group_id,
        });
      } else {
        await addReaction(prayer.id, 'pray');
      }

      // 기도 카운트 증가 및 상태 업데이트
      setReactionCount((prev) => prev + 1);
      setHasEverPrayed(true);
    } catch (error) {
      console.error('리액션 처리 실패:', error);
    } finally {
      setIsReacting(false);
    }
  };

  const getFormattedTimeDisplay = (timestamp: string) => {
    return getFormattedTime(timestamp);
  };

  const isReactionDisabled = isReacting || prayer.is_offline;

  return (
    <div className="glass-card rounded-lg p-6 slide-up">
      {/* Header */}
      <div className="flex items-center space-x-2.5 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(115,87,106,0.14)] bg-[rgba(115,87,106,0.08)]">
          <span className="text-xs font-semibold text-[color:var(--primary)]">
            {(prayer.author_name || prayer.author?.nickname || '익명')
              .charAt(0)}
          </span>
        </div>
        <span className="text-sm font-medium text-[color:var(--text-secondary)]">
          {prayer.author_name || prayer.author?.nickname || '익명'}
        </span>
        {prayer.is_offline && (
          <span className="text-xs text-orange-500 ml-1">· 동기화 대기중</span>
        )}
        <span className="ml-auto text-xs text-[color:var(--text-muted)]">
          {getFormattedTimeDisplay(prayer.created_at)}
        </span>
      </div>

      {/* Content */}
      <div className="mb-5">
        <h3 className="mb-3 text-[17px] font-semibold leading-snug text-[color:var(--text-primary)]">
          {prayer.title}
        </h3>
        <p className="whitespace-pre-wrap text-[15px] leading-7 text-[color:var(--text-secondary)]">
          {prayer.content}
        </p>
      </div>

      {/* Action Bar */}
      <div
        className={`border-t border-[rgba(115,87,106,0.1)] pt-4 ${
          isMyPrayer ? 'flex justify-end' : 'flex items-center justify-between'
        }`}
      >
        {!isMyPrayer && (
          <button
            onClick={handleReactionClick}
            disabled={isReactionDisabled}
            className={`primary-button flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all duration-200 ${
              isReactionDisabled ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            {isReacting && <LoadingSpinner />}
            {!isReacting && <FaRegHeart size={13} />}
            {isReacting ? '처리 중...' : hasEverPrayed ? '계속 기도' : '함께 기도'}
          </button>
        )}

        <span className="text-xs text-[color:var(--text-muted)]">
          {reactionCount}명이 함께 기도
        </span>
      </div>

      {/* Offline Notice */}
      {prayer.is_offline && (
        <div className="glass-card mt-4 rounded-lg border-orange-200 bg-orange-50/90 p-3">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">!</span>
            </div>
            <p className="text-sm text-orange-800 font-medium">
              이 기도제목은 오프라인에서 작성되었습니다. 온라인 복구 시 자동으로
              동기화됩니다.
            </p>
          </div>
        </div>
      )}

      {/* 기도 이펙트 애니메이션 */}
      {showPrayEffect && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-end justify-center pb-20">
          <div className="animate-pray-effect">
            <span className="text-6xl">🙏</span>
          </div>
        </div>
      )}
    </div>
  );
}
