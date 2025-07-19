import { createSupabaseBrowserClient } from '@/lib/supabase';

interface CreateGroupRequest {
  name: string;
  description?: string;
}

interface CreateGroupResponse {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
}

interface JoinGroupByInviteRequest {
  inviteCode: string;
}

interface JoinGroupByInviteResponse {
  groupId: string;
  groupName: string;
  role: string;
}

interface GetUserGroupsResponse {
  groups: Array<{
    id: string;
    name: string;
    description?: string;
    invite_code: string;
    created_at: string;
    group_members: Array<{
      user_id: string;
      role: 'LEADER' | 'MEMBER';
    }>;
  }>;
}

export const createGroup = async (
  name: string
): Promise<CreateGroupResponse> => {
  const supabase = createSupabaseBrowserClient();
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session?.access_token) {
    throw new Error('Authentication required');
  }

  const response = await fetch('/api/groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.session.access_token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create group');
  }

  const data = await response.json();

  // API 응답 형식을 CreateGroupResponse로 변환
  return {
    id: data.group.id,
    name: data.group.name,
    inviteCode: data.group.invite_code,
    createdAt: data.group.created_at,
  };
};

// 그룹 ID로 직접 참여하는 함수 (메인 참여 방식)
export const joinGroupById = async (
  groupId: string
): Promise<JoinGroupByInviteResponse> => {
  const supabase = createSupabaseBrowserClient();
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session?.access_token) {
    throw new Error('Authentication required');
  }

  const response = await fetch('/api/groups/join', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.session.access_token}`,
    },
    body: JSON.stringify({ groupId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to join group');
  }

  return response.json();
};

// 스마트 그룹 참여 함수 - 링크에서 그룹 ID 추출하여 참여
export const joinGroupSmart = async (
  input: string
): Promise<JoinGroupByInviteResponse> => {
  const trimmedInput = input.trim();
  console.log('joinGroupSmart - 입력값:', trimmedInput);

  // 링크에서 그룹 ID 추출
  let groupId = trimmedInput;

  // 초대 링크 패턴 확인 (/join/{groupId})
  const uuidRegex =
    /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
  const linkMatch = trimmedInput.match(
    new RegExp(`/join/(${uuidRegex.source})`, 'i')
  );
  if (linkMatch) {
    groupId = linkMatch[1];
    console.log('joinGroupSmart - 링크에서 추출된 그룹 ID:', groupId);
  } else {
    // URL에서 그룹 ID 추출 시도
    try {
      const url = new URL(trimmedInput);
      const pathMatch = url.pathname.match(
        new RegExp(`/join/(${uuidRegex.source})`, 'i')
      );
      if (pathMatch) {
        groupId = pathMatch[1];
        console.log('joinGroupSmart - URL에서 추출된 그룹 ID:', groupId);
      }
    } catch (error) {
      console.log('joinGroupSmart - URL 파싱 실패:', error);
    }
  }

  console.log('joinGroupSmart - 최종 그룹 ID:', groupId);

  // UUID 형태인지 확인
  const uuidPattern =
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  if (!uuidPattern.test(groupId)) {
    console.log('joinGroupSmart - UUID 패턴 매치 실패:', groupId);
    throw new Error('올바른 초대 링크 형식이 아닙니다.');
  }

  console.log('joinGroupSmart - UUID 패턴 매치 성공, joinGroupById 호출');
  return await joinGroupById(groupId);
};

export const getUserGroups = async (): Promise<GetUserGroupsResponse> => {
  const supabase = createSupabaseBrowserClient();
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session?.access_token) {
    throw new Error('Authentication required');
  }

  const response = await fetch('/api/groups', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch groups');
  }

  return response.json();
};
