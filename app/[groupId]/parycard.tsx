'use client';

import { useState, useEffect } from 'react';
import { addReaction, removeReaction } from '@/apis/reactions';
import { getFormattedTime } from '@/lib/timeFormatter';
import { queueOfflineAction, isOnline } from '@/lib/offlineStorage';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { PrayerWithReactions } from '@/types/prayer';
import { createSupabaseBrowserClient } from '@/lib/supabase';

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
    <div className="glass-card p-6 rounded-2xl slide-up">
      {/* Header */}
      <div className="flex items-center space-x-2.5 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border border-white/60">
          <span className="text-gray-500 font-medium text-xs">
            {(prayer.author_name || prayer.author?.nickname || '익명')
              .charAt(0)}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-600">
          {prayer.author_name || prayer.author?.nickname || '익명'}
        </span>
        {prayer.is_offline && (
          <span className="text-xs text-orange-500 ml-1">· 동기화 대기중</span>
        )}
        <span className="ml-auto text-xs text-gray-400">
          {getFormattedTimeDisplay(prayer.created_at)}
        </span>
      </div>

      {/* Content */}
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900 mb-2 leading-snug">
          {prayer.title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
          {prayer.content}
        </p>
      </div>

      {/* Action Bar */}
      <div
        className={`pt-4 border-t border-gray-100/60 ${
          isMyPrayer ? 'flex justify-end' : 'flex items-center justify-between'
        }`}
      >
        {!isMyPrayer && (
          <button
            onClick={handleReactionClick}
            disabled={isReactionDisabled}
            className={`glass-button px-4 py-2 rounded-xl text-sm font-medium text-gray-700 transition-all duration-200 flex items-center gap-2 ${
              isReactionDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            }`}
          >
            {isReacting && <LoadingSpinner />}
            {isReacting ? '처리 중...' : hasEverPrayed ? '또 기도합니다' : '기도하기'}
          </button>
        )}

        <span className="text-xs text-gray-400">
          {reactionCount}번 기도 받았습니다
        </span>
      </div>

      {/* Offline Notice */}
      {prayer.is_offline && (
        <div className="mt-4 glass-card bg-orange-50/90 border-orange-200 p-3 rounded-xl">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
              <span className="text-white text-xs">⚠️</span>
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
