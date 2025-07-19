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
