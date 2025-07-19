import { useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { mutate } from 'swr';

interface ReactionPayload {
  id: string;
  prayer_id: string;
  user_id: string;
  type: 'pray' | 'amen';
  created_at: string;
}

export function useRealtimeReactions(groupId: string) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 실시간 리액션 구독 설정
  const setupReactionSubscription = useCallback(() => {
    const channel = supabase
      .channel(`reactions-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
        },
        (payload: RealtimePostgresChangesPayload<ReactionPayload>) => {
          console.log('Reaction realtime update:', payload);

          // 해당 그룹의 기도제목 목록 캐시 업데이트
          const cacheKey = `/api/prayers?groupId=${groupId}`;

          if (
            payload.eventType === 'INSERT' ||
            payload.eventType === 'DELETE'
          ) {
            // 기도제목 목록 다시 가져오기 (리액션 카운트 업데이트)
            mutate(cacheKey);
          }
        }
      )
      .subscribe((status: string) => {
        console.log('Reaction subscription status:', status);
        if (status === 'CHANNEL_ERROR') {
          console.error('Reaction subscription error');
        }
      });

    return channel;
  }, [groupId, supabase]);

  // 컴포넌트 마운트 시 구독 시작
  useEffect(() => {
    const channel = setupReactionSubscription();

    return () => {
      channel?.unsubscribe();
    };
  }, [setupReactionSubscription]);

  return {
    // 이 훅은 구독만 담당하므로 별도 반환값 없음
  };
}
