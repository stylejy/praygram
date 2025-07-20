import { Reaction } from '@/types/prayer';

const API_BASE = '/api/reactions';

// 인증 토큰 가져오기
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  // 쿠키에서 토큰 찾기
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'supabase-auth-token') {
      return value;
    }
  }

  // localStorage 폴백
  return localStorage.getItem('supabase.auth.token');
}

// 리액션 추가
export async function addReaction(
  prayerId: string,
  type: 'pray' | 'amen' = 'pray'
): Promise<Reaction> {
  const token = getAuthToken();

  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({
      prayer_id: prayerId,
      type,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('로그인이 필요합니다');
    }
    if (response.status === 403) {
      throw new Error('권한이 없습니다');
    }

    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error?.message || `리액션 추가 실패: ${response.statusText}`
    );
  }

  return response.json();
}

// 리액션 취소
export async function removeReaction(
  prayerId: string,
  type: 'pray' | 'amen' = 'pray'
): Promise<void> {
  const token = getAuthToken();

  const response = await fetch(
    `${API_BASE}?prayer_id=${prayerId}&type=${type}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('로그인이 필요합니다');
    }
    if (response.status === 403) {
      throw new Error('권한이 없습니다');
    }
    if (response.status === 404) {
      throw new Error('리액션을 찾을 수 없습니다');
    }

    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error?.message || `리액션 취소 실패: ${response.statusText}`
    );
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
