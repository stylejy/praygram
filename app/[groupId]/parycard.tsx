'use client';

import { getFormattedTime } from '@/lib/timeFormatter';
import { LiaPrayingHandsSolid } from 'react-icons/lia';
import { useState, useEffect } from 'react';
import { addReaction, removeReaction } from '@/apis/reactions';
import { PrayerWithReactions } from '@/types/prayer';

interface Props {
  prayer: PrayerWithReactions;
}

export default function Praycard(props: Props) {
  const { prayer } = props;
  const [isReacting, setIsReacting] = useState(false);
  const [reactionCount, setReactionCount] = useState(
    prayer.reaction_count || 0
  );
  const [hasReacted, setHasReacted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 현재 사용자 ID 가져오기
  useEffect(() => {
    const userId = localStorage.getItem('id');
    setCurrentUserId(userId);

    // 현재 사용자가 이미 리액션했는지 확인
    if (userId && prayer.reactions) {
      const hasUserReacted = prayer.reactions.some(
        (reaction) => reaction.user_id === userId
      );
      setHasReacted(hasUserReacted);
    }
  }, [prayer.reactions]);

  const handleReactionClick = async () => {
    if (isReacting || !currentUserId) return;

    try {
      setIsReacting(true);

      if (hasReacted) {
        // 리액션 취소
        await removeReaction(prayer.id, 'pray');
        setReactionCount((prev) => Math.max(0, prev - 1));
        setHasReacted(false);
      } else {
        // 리액션 추가
        await addReaction(prayer.id, 'pray');
        setReactionCount((prev) => prev + 1);
        setHasReacted(true);
      }
    } catch (error) {
      console.error('리액션 처리 실패:', error);
      // 에러 메시지를 사용자에게 표시할 수 있음
    } finally {
      setIsReacting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-fit bg-white/70 rounded-3xl shadow-md backdrop-blur-lg p-5">
      <header className="text-gray-400 font-semibold text-center mb-2">
        {prayer.author?.nickname || '알 수 없음'} 님의 기도제목
      </header>
      <div className="flex flex-row items-center justify-center w-full pb-4">
        <time className="text-xs text-gray-400">
          {getFormattedTime(prayer.created_at)}
        </time>
      </div>
      <article className="text-wrap text-gray-700 w-full">
        <h3 className="font-semibold text-lg mb-2 text-center">
          {prayer.title}
        </h3>
        {prayer.content && (
          <div className="text-sm text-gray-600 mt-2">
            <pre className="whitespace-pre-wrap break-words">
              {prayer.content}
            </pre>
          </div>
        )}
      </article>
      <div className="flex flex-col items-center justify-center mt-4">
        <button
          onClick={handleReactionClick}
          disabled={isReacting || !currentUserId}
          className={`flex flex-row items-center justify-center w-fit h-10 px-3 rounded-3xl transition-colors ${
            hasReacted
              ? 'bg-blue-500 text-white border-2 border-blue-500'
              : 'bg-slate-100 text-slate-500 border-2 border-slate-500 hover:bg-slate-200'
          } ${
            isReacting || !currentUserId ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <LiaPrayingHandsSolid className="w-4 h-4" />
          <span className="pl-1 text-sm">
            {hasReacted ? '기도완료' : '기도하기'}
          </span>
        </button>
        {reactionCount > 0 && (
          <span className="text-sm mt-2 text-gray-400">
            {reactionCount}번의 기도를 받았어요!
          </span>
        )}
      </div>
    </div>
  );
}
