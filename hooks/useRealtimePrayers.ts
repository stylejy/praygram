import { useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { createBrowserClient } from '@supabase/ssr';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { PrayerWithReactions } from '@/types/prayer';
import {
  mergeOfflineData,
  syncOfflineData,
  isOnline,
} from '@/lib/offlineStorage';

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
    groupId ? `/api/prayers?groupId=${groupId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      errorRetryCount: 3,
      fallbackData: [],
    }
  );

  // 오프라인 데이터와 병합
  const mergedPrayers = prayers ? mergeOfflineData(prayers, groupId) : [];

  // 온라인 상태 복구 시 동기화
  useEffect(() => {
    const handleOnline = async () => {
      console.log('Network restored, syncing offline data...');
      await syncOfflineData();
      // 동기화 후 데이터 다시 가져오기
      mutatePrayers();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [mutatePrayers]);

  // 실시간 구독 설정 (온라인일 때만)
  const setupRealtimeSubscription = useCallback(() => {
    if (!isOnline() || !groupId) return null;

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
                const merged = mergeOfflineData(
                  [payload.new as PrayerWithReactions, ...currentPrayers],
                  groupId
                );
                return merged;
              },
              false
            );
          }

          // 기도제목 수정
          if (payload.eventType === 'UPDATE') {
            mutatePrayers(
              (currentPrayers: PrayerWithReactions[] | undefined) => {
                if (!currentPrayers) return currentPrayers;
                const updated = currentPrayers.map(
                  (prayer: PrayerWithReactions) =>
                    prayer.id === payload.new.id
                      ? (payload.new as PrayerWithReactions)
                      : prayer
                );
                return mergeOfflineData(updated, groupId);
              },
              false
            );
          }

          // 기도제목 삭제
          if (payload.eventType === 'DELETE') {
            mutatePrayers(
              (currentPrayers: PrayerWithReactions[] | undefined) => {
                if (!currentPrayers) return currentPrayers;
                const filtered = currentPrayers.filter(
                  (prayer: PrayerWithReactions) => prayer.id !== payload.old.id
                );
                return mergeOfflineData(filtered, groupId);
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

  // 앱 시작 시 오프라인 데이터 동기화 시도
  useEffect(() => {
    if (isOnline() && groupId) {
      syncOfflineData();
    }
  }, [groupId]);

  return {
    prayers: mergedPrayers,
    error,
    isLoading: !prayers && !error,
    mutate: mutatePrayers,
    isOffline: !isOnline(),
  };
}
