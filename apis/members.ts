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
    console.log('joinGroup 호출 - groupId:', groupId, 'memberId:', memberId);

    // 그룹 존재 확인
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, name')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      console.error('그룹 조회 실패:', groupError);
      throw new Error(
        '존재하지 않는 기도모임입니다. 초대 링크를 다시 확인해주세요.'
      );
    }

    console.log('그룹 조회 성공:', group);

    // 이미 해당 그룹의 멤버인지 확인
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', memberId)
      .single();

    if (existingMember) {
      console.log('이미 그룹 멤버입니다:', existingMember);
      return {
        id: memberId,
        group: groupId,
        role: existingMember.role,
        message: '이미 그룹에 참여하고 있습니다.',
      };
    }

    console.log('새 멤버로 추가 시도...');

    // 새 멤버로 추가
    const { data: newMember, error: insertError } = await supabase
      .from('group_members')
      .insert([
        {
          group_id: groupId,
          user_id: memberId,
          role: 'MEMBER',
        },
      ])
      .select('group_id, user_id, role')
      .single();

    if (insertError) {
      console.error('멤버 추가 실패:', insertError);
      throw new Error('기도모임 참여에 실패했습니다. 다시 시도해주세요.');
    }

    console.log('멤버 추가 성공:', newMember);

    return {
      id: newMember.user_id,
      group: newMember.group_id,
      role: newMember.role,
      message: '그룹 참여가 완료되었습니다.',
    };
  } catch (error) {
    console.error('joinGroup error:', error);
    throw error;
  }
};
