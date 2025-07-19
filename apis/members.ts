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

  try {
    // 먼저 멤버가 존재하는지 확인
    const { data: existingMember, error: checkError } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (checkError) {
      console.error('멤버 확인 실패:', checkError);

      // 404 에러인 경우 (멤버가 존재하지 않음)
      if (checkError.code === 'PGRST116') {
        // 새 멤버로 생성 시도
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: newMember, error: createError } = await supabase
            .from('members')
            .insert([
              {
                id: memberId,
                nickname: user.user_metadata?.name || user.email || 'User',
                group: groupId,
                is_manager: false,
              },
            ])
            .select()
            .single();

          if (createError) {
            console.error('멤버 생성 실패:', createError);
            throw new Error('사용자 등록에 실패했습니다. 다시 시도해주세요.');
          }

          return newMember;
        }
      }

      throw new Error('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
    }

    // 이미 그룹에 속해있는지 확인
    if (existingMember.group === groupId) {
      console.log('이미 그룹에 속해있습니다:', groupId);
      return existingMember;
    }

    // 그룹 정보 업데이트
    const { data, error } = await supabase
      .from('members')
      .update({ group: groupId })
      .eq('id', memberId)
      .select()
      .single();

    if (error) {
      console.error('그룹 참여 실패:', error);
      if (error.code === 'PGRST116') {
        throw new Error('존재하지 않는 기도모임입니다.');
      }
      throw new Error('기도모임 참여에 실패했습니다. 다시 시도해주세요.');
    }

    return data;
  } catch (error) {
    console.error('joinGroup error:', error);
    throw error;
  }
};
