import { useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { createBrowserClient } from '@supabase/ssr';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { PrayerWithReactions } from '@/types/prayer';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useRealtimePrayers(groupId: string) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // SWR로 기도제목 데이터 가져오기
  const {
    data: prayers,
    error,
    mutate: mutatePrayers,
  } = useSWR<PrayerWithReactions[]>(
    `/api/prayers?groupId=${groupId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      errorRetryCount: 3,
    }
  );

  // 실시간 구독 설정
  const setupRealtimeSubscription = useCallback(() => {
    const channel = supabase
      .channel(`prayers-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prayers',
          filter: `group_id=eq.${groupId}`,
        },
        (payload: RealtimePostgresChangesPayload<PrayerWithReactions>) => {
          console.log('Prayer realtime update:', payload);

          // 새로운 기도제목 추가
          if (payload.eventType === 'INSERT') {
            mutatePrayers(
              (currentPrayers: PrayerWithReactions[] | undefined) => {
                if (!currentPrayers)
                  return [payload.new as PrayerWithReactions];
                return [payload.new as PrayerWithReactions, ...currentPrayers];
              },
              false
            );
          }

          // 기도제목 수정
          if (payload.eventType === 'UPDATE') {
            mutatePrayers(
              (currentPrayers: PrayerWithReactions[] | undefined) => {
                if (!currentPrayers) return currentPrayers;
                return currentPrayers.map((prayer: PrayerWithReactions) =>
                  prayer.id === payload.new.id
                    ? (payload.new as PrayerWithReactions)
                    : prayer
                );
              },
              false
            );
          }

          // 기도제목 삭제
          if (payload.eventType === 'DELETE') {
            mutatePrayers(
              (currentPrayers: PrayerWithReactions[] | undefined) => {
                if (!currentPrayers) return currentPrayers;
                return currentPrayers.filter(
                  (prayer: PrayerWithReactions) => prayer.id !== payload.old.id
                );
              },
              false
            );
          }
        }
      )
      .subscribe((status: string) => {
        console.log('Prayer subscription status:', status);
        if (status === 'CHANNEL_ERROR') {
          console.error('Prayer subscription error');
        }
      });

    return channel;
  }, [groupId, supabase, mutatePrayers]);

  // 컴포넌트 마운트 시 구독 시작
  useEffect(() => {
    const channel = setupRealtimeSubscription();

    return () => {
      channel?.unsubscribe();
    };
  }, [setupRealtimeSubscription]);

  return {
    prayers: prayers || [],
    error,
    isLoading: !prayers && !error,
    mutate: mutatePrayers,
  };
}
