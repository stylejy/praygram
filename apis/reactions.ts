import { Reaction } from '@/types/prayer';

const API_BASE = '/api/reactions';

// 리액션 추가
export async function addReaction(
  prayerId: string,
  type: 'pray' | 'amen' = 'pray'
): Promise<Reaction> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('supabase.auth.token')}`,
    },
    body: JSON.stringify({
      prayer_id: prayerId,
      type,
    }),
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('이미 기도했습니다');
    }
    throw new Error(`리액션 추가 실패: ${response.statusText}`);
  }

  return response.json();
}

// 리액션 취소
export async function removeReaction(
  prayerId: string,
  type: 'pray' | 'amen' = 'pray'
): Promise<void> {
  const response = await fetch(
    `${API_BASE}?prayer_id=${prayerId}&type=${type}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('supabase.auth.token')}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`리액션 취소 실패: ${response.statusText}`);
  }
}

// 특정 기도제목의 리액션 조회
export async function getPrayerReactions(
  prayerId: string
): Promise<Reaction[]> {
  const response = await fetch(`/api/prayers/${prayerId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('supabase.auth.token')}`,
    },
  });

  if (!response.ok) {
    throw new Error(`리액션 조회 실패: ${response.statusText}`);
  }

  const prayer = await response.json();
  return prayer.reactions || [];
}
