import { createSupabaseBrowserClient } from '@/lib/supabase';

export interface Member {
  id: string;
  nickname: string;
  group: string | null;
  is_manager: boolean;
  created_at: string;
  updated_at: string;
}

// 사용자의 멤버 정보 조회
export async function getMembers(userId: string): Promise<Member[] | null> {
  try {
    const response = await fetch(`/api/members?userId=${userId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return []; // 멤버가 없으면 빈 배열 반환
      }
      throw new Error(`Failed to get members: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting members:', error);
    return null;
  }
}

// 새 멤버 생성
export async function createMembers(
  nickname: string
): Promise<Member[] | null> {
  try {
    const response = await fetch('/api/members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nickname,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create member: ${response.statusText}`);
    }

    const member = await response.json();
    return [member]; // 배열로 감싸서 반환 (기존 코드 호환성)
  } catch (error) {
    console.error('Error creating member:', error);
    return null;
  }
}

export const joinGroup = async (groupId: string, memberId: string) => {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('members')
    .update({ group: groupId })
    .eq('id', memberId)
    .select();

  if (error) {
    throw error;
  }

  return data;
};
