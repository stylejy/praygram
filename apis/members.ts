import { createSupabaseBrowserClient } from '@/lib/supabase';

interface Member {
  id: string;
  nickname: string;
  group: string | null;
  is_manager: boolean;
  created_at: string;
  updated_at: string;
}

// 기존 멤버 정보 조회
export async function getMembers(userId: string): Promise<Member[] | null> {
  try {
    const response = await fetch(`/api/members?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get member: ${response.statusText}`);
    }

    const members = await response.json();
    return members;
  } catch (error) {
    console.error('Error getting member:', error);
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

// 멤버 정보 업데이트
export async function updateMember(
  groupId?: string,
  isManager?: boolean
): Promise<Member | null> {
  try {
    const response = await fetch('/api/members', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        groupId,
        isManager,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update member: ${response.statusText}`);
    }

    const member = await response.json();
    return member;
  } catch (error) {
    console.error('Error updating member:', error);
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
