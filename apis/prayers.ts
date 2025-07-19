import {
  Prayer,
  CreatePrayerRequest,
  UpdatePrayerRequest,
  PrayerWithReactions,
} from '@/types/prayer';

const API_BASE = '/api/prayers';

// 기도제목 목록 조회
export async function getGroupPrayers(
  groupId: string
): Promise<PrayerWithReactions[]> {
  const response = await fetch(`${API_BASE}?group_id=${groupId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('supabase.auth.token')}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch prayers: ${response.statusText}`);
  }

  return response.json();
}

// 개별 기도제목 조회
export async function getPrayer(id: string): Promise<PrayerWithReactions> {
  const response = await fetch(`${API_BASE}/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('supabase.auth.token')}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch prayer: ${response.statusText}`);
  }

  return response.json();
}

// 기도제목 생성
export async function createPrayer(data: CreatePrayerRequest): Promise<Prayer> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('supabase.auth.token')}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create prayer');
  }

  return response.json();
}

// 기도제목 수정
export async function updatePrayer(
  id: string,
  data: UpdatePrayerRequest
): Promise<Prayer> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('supabase.auth.token')}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update prayer');
  }

  return response.json();
}

// 기도제목 삭제
export async function deletePrayer(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('supabase.auth.token')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to delete prayer');
  }
}

// 내 기도제목 조회 (사용자별)
export async function getMyPrayers(): Promise<PrayerWithReactions[]> {
  // 현재 사용자의 모든 그룹 기도제목을 조회
  const response = await fetch(`${API_BASE}?my_prayers=true`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('supabase.auth.token')}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch my prayers: ${response.statusText}`);
  }

  return response.json();
}
