import { createSupabaseBrowserClient } from '@/lib/supabase';

interface Group {
  name: string;
}

interface CreateGroupRequest {
  name: string;
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

export const getGroup = async (groupId: string) => {
  const supabase = createSupabaseBrowserClient();
  const result = await supabase.from('groups').select('*').eq('id', groupId);

  return (result.data as unknown as Group[])[0];
};

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

export const joinGroupByInviteCode = async (
  inviteCode: string
): Promise<JoinGroupByInviteResponse> => {
  const supabase = createSupabaseBrowserClient();
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session?.access_token) {
    throw new Error('Authentication required');
  }

  const response = await fetch('/api/groups/invite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.session.access_token}`,
    },
    body: JSON.stringify({ inviteCode }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to join group');
  }

  return response.json();
};

// 그룹 ID로 직접 참여하는 함수
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

// 스마트 그룹 참여 함수 - 그룹 ID 또는 초대 코드 자동 감지
export const joinGroupSmart = async (
  input: string
): Promise<JoinGroupByInviteResponse> => {
  const trimmedInput = input.trim();

  // UUID 형태 확인 (36자리 하이픈 포함)
  const uuidPattern =
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

  if (uuidPattern.test(trimmedInput)) {
    // UUID 형태인 경우, 먼저 그룹 ID로 시도
    try {
      return await joinGroupById(trimmedInput);
    } catch (error) {
      // 그룹 ID로 실패하면 초대 코드로 시도
      console.log('그룹 ID로 참여 실패, 초대 코드로 재시도:', error);
      return await joinGroupByInviteCode(trimmedInput);
    }
  } else {
    // UUID 형태가 아닌 경우 초대 코드로 처리
    return await joinGroupByInviteCode(trimmedInput);
  }
};

export const getUserGroups = async () => {
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
