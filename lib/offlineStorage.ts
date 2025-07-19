import { PrayerWithReactions, CreatePrayerRequest } from '@/types/prayer';

const OFFLINE_PRAYERS_KEY = 'praygram_offline_prayers';
const OFFLINE_QUEUE_KEY = 'praygram_offline_queue';

export interface OfflinePrayer extends CreatePrayerRequest {
  id: string;
  timestamp: number;
  synced: boolean;
}

export interface OfflineAction {
  id: string;
  type: 'CREATE_PRAYER' | 'ADD_REACTION' | 'REMOVE_REACTION';
  data: any;
  timestamp: number;
  groupId: string;
}

// 오프라인 기도제목 저장
export function saveOfflinePrayer(prayer: CreatePrayerRequest): string {
  if (typeof window === 'undefined') return '';

  const offlinePrayer: OfflinePrayer = {
    ...prayer,
    id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    synced: false,
  };

  const existingPrayers = getOfflinePrayers();
  const updatedPrayers = [...existingPrayers, offlinePrayer];

  localStorage.setItem(OFFLINE_PRAYERS_KEY, JSON.stringify(updatedPrayers));
  return offlinePrayer.id;
}

// 오프라인 기도제목 조회
export function getOfflinePrayers(): OfflinePrayer[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(OFFLINE_PRAYERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get offline prayers:', error);
    return [];
  }
}

// 특정 그룹의 오프라인 기도제목 조회
export function getOfflinePrayersByGroup(groupId: string): OfflinePrayer[] {
  return getOfflinePrayers().filter((prayer) => prayer.group_id === groupId);
}

// 오프라인 액션 큐에 추가
export function queueOfflineAction(
  action: Omit<OfflineAction, 'id' | 'timestamp'>
): void {
  if (typeof window === 'undefined') return;

  const offlineAction: OfflineAction = {
    ...action,
    id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };

  const existingQueue = getOfflineQueue();
  const updatedQueue = [...existingQueue, offlineAction];

  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));
}

// 오프라인 큐 조회
export function getOfflineQueue(): OfflineAction[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get offline queue:', error);
    return [];
  }
}

// 오프라인 큐 클리어
export function clearOfflineQueue(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

// 동기화된 오프라인 기도제목 제거
export function removeSyncedOfflinePrayers(): void {
  if (typeof window === 'undefined') return;

  const prayers = getOfflinePrayers();
  const unsyncedPrayers = prayers.filter((prayer) => !prayer.synced);

  localStorage.setItem(OFFLINE_PRAYERS_KEY, JSON.stringify(unsyncedPrayers));
}

// 오프라인 기도제목을 동기화됨으로 마크
export function markPrayerAsSynced(offlineId: string): void {
  if (typeof window === 'undefined') return;

  const prayers = getOfflinePrayers();
  const updatedPrayers = prayers.map((prayer) =>
    prayer.id === offlineId ? { ...prayer, synced: true } : prayer
  );

  localStorage.setItem(OFFLINE_PRAYERS_KEY, JSON.stringify(updatedPrayers));
}

// 온라인 상태 확인
export function isOnline(): boolean {
  return typeof window !== 'undefined' && navigator.onLine;
}

// 오프라인 데이터와 온라인 데이터 병합
export function mergeOfflineData(
  onlineData: PrayerWithReactions[],
  groupId: string
): PrayerWithReactions[] {
  const offlinePrayers = getOfflinePrayersByGroup(groupId);

  // 오프라인 기도제목을 온라인 형식으로 변환
  const offlineAsOnline: PrayerWithReactions[] = offlinePrayers
    .filter((prayer) => !prayer.synced)
    .map(
      (prayer) =>
        ({
          id: prayer.id,
          title: prayer.title,
          content: prayer.content,
          group_id: prayer.group_id,
          author_id: 'offline_user',
          is_private: prayer.is_private || false,
          created_at: new Date(prayer.timestamp).toISOString(),
          updated_at: new Date(prayer.timestamp).toISOString(),
          reactions: [],
          reaction_count: 0,
          author: {
            nickname: '나 (오프라인)',
          },
          is_offline: true, // 오프라인 표시를 위한 플래그
        } as PrayerWithReactions & { is_offline: boolean })
    );

  // 온라인 데이터와 오프라인 데이터 병합 (최신순)
  const merged = [...onlineData, ...offlineAsOnline];
  return merged.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// 오프라인 동기화 실행
export async function syncOfflineData(): Promise<void> {
  if (!isOnline()) return;

  const queue = getOfflineQueue();
  const prayers = getOfflinePrayers().filter((prayer) => !prayer.synced);

  try {
    // 오프라인 기도제목 동기화
    for (const prayer of prayers) {
      try {
        const response = await fetch('/api/prayers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: prayer.title,
            content: prayer.content,
            group_id: prayer.group_id,
          }),
        });

        if (response.ok) {
          markPrayerAsSynced(prayer.id);
        }
      } catch (error) {
        console.error('Failed to sync prayer:', prayer.id, error);
      }
    }

    // 오프라인 액션 큐 동기화
    for (const action of queue) {
      try {
        switch (action.type) {
          case 'ADD_REACTION':
            await fetch('/api/reactions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action.data),
            });
            break;
          case 'REMOVE_REACTION':
            await fetch(
              `/api/reactions?prayer_id=${action.data.prayer_id}&type=${action.data.type}`,
              {
                method: 'DELETE',
              }
            );
            break;
        }
      } catch (error) {
        console.error('Failed to sync action:', action.id, error);
      }
    }

    // 성공적으로 동기화된 항목들 정리
    removeSyncedOfflinePrayers();
    clearOfflineQueue();
  } catch (error) {
    console.error('Offline sync failed:', error);
  }
}
