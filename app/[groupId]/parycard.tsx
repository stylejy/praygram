'use client';

import { getFormattedTime } from '@/lib/timeFormatter';
import { LiaPrayingHandsSolid } from 'react-icons/lia';
import { useState, useEffect } from 'react';
import { addReaction, removeReaction } from '@/apis/reactions';
import { PrayerWithReactions } from '@/types/prayer';
import { queueOfflineAction, isOnline } from '@/lib/offlineStorage';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

interface Props {
  prayer: PrayerWithReactions & { is_offline?: boolean };
}

export default function Praycard(props: Props) {
  const { prayer } = props;
  const [isReacting, setIsReacting] = useState(false);
  const [reactionCount, setReactionCount] = useState(
    prayer.reaction_count || 0
  );
  const [hasReacted, setHasReacted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // 현재 사용자 ID 가져오기
  useEffect(() => {
    const userId = localStorage.getItem('id');
    setCurrentUserId(userId);

    // 현재 사용자가 이미 리액션했는지 확인
    if (userId && prayer.reactions) {
      const userReaction = prayer.reactions.find((r) => r.user_id === userId);
      setHasReacted(!!userReaction);
    }
  }, [prayer.reactions]);

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

      if (hasReacted) {
        if (isOfflineMode) {
          // 오프라인: 큐에 저장
          queueOfflineAction({
            type: 'REMOVE_REACTION',
            data: { prayer_id: prayer.id, type: 'pray' },
            groupId: prayer.group_id,
          });
        } else {
          // 온라인: API 호출
          await removeReaction(prayer.id, 'pray');
        }

        setHasReacted(false);
        setReactionCount((prev) => Math.max(0, prev - 1));
      } else {
        if (isOfflineMode) {
          // 오프라인: 큐에 저장
          queueOfflineAction({
            type: 'ADD_REACTION',
            data: { prayer_id: prayer.id, type: 'pray' },
            groupId: prayer.group_id,
          });
        } else {
          // 온라인: API 호출
          await addReaction(prayer.id, 'pray');
        }

        setHasReacted(true);
        setReactionCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('리액션 처리 실패:', error);

      if (!isOfflineMode) {
        // 온라인이지만 실패한 경우 오프라인으로 처리
        try {
          if (hasReacted) {
            queueOfflineAction({
              type: 'REMOVE_REACTION',
              data: { prayer_id: prayer.id, type: 'pray' },
              groupId: prayer.group_id,
            });
            setHasReacted(false);
            setReactionCount((prev) => Math.max(0, prev - 1));
          } else {
            queueOfflineAction({
              type: 'ADD_REACTION',
              data: { prayer_id: prayer.id, type: 'pray' },
              groupId: prayer.group_id,
            });
            setHasReacted(true);
            setReactionCount((prev) => prev + 1);
          }
        } catch (offlineError) {
          alert('리액션 처리에 실패했습니다. 다시 시도해주세요.');
        }
      } else {
        alert('오프라인 상태에서 리액션 처리에 실패했습니다.');
      }
    } finally {
      setIsReacting(false);
    }
  };

  const isReactionDisabled = prayer.is_offline || isReacting;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-800">
            {prayer.author?.nickname || '익명'}
          </span>
          {prayer.is_offline && (
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
              동기화 대기중
            </span>
          )}
          {isOfflineMode && !prayer.is_offline && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              오프라인
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {getFormattedTime(prayer.created_at)}
        </span>
      </div>

      {/* 제목 */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {prayer.title}
      </h3>

      {/* 내용 */}
      <p className="text-gray-700 text-sm leading-relaxed mb-4">
        {prayer.content}
      </p>

      {/* 리액션 버튼 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={handleReactionClick}
          disabled={isReactionDisabled}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            isReactionDisabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : hasReacted
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          {isReacting ? (
            <>
              <LoadingSpinner className="w-4 h-4" />
              <span>처리 중...</span>
            </>
          ) : (
            <>
              <span className="text-lg">🙏</span>
              <span>{hasReacted ? '기도했습니다' : '기도하기'}</span>
            </>
          )}
          <span
            className={`ml-1 ${hasReacted ? 'text-blue-600' : 'text-gray-500'}`}
          >
            {reactionCount}
          </span>
        </button>

        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <LiaPrayingHandsSolid size={16} />
          <span>{reactionCount}명이 기도했습니다</span>
        </div>
      </div>

      {prayer.is_offline && (
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
          이 기도제목은 오프라인에서 작성되었습니다. 온라인 복구 시 자동으로
          동기화됩니다.
        </div>
      )}
    </div>
  );
}
