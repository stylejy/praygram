import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createErrorResponse, ApiError } from '@/lib/errors';
import { v4 as uuidv4 } from 'uuid';

interface CreateGroupRequest {
  name: string;
}

interface GroupResponse {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { name }: CreateGroupRequest = await request.json();

    if (!name?.trim()) {
      throw new ApiError(400, 'Group name is required');
    }

    const supabase = createSupabaseServerClient();
    const inviteCode = uuidv4();

    // 트랜잭션으로 그룹 생성 및 리더 등록
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert([
        {
          name: name.trim(),
          invite_code: inviteCode,
        },
      ])
      .select()
      .single();

    if (groupError) {
      throw new ApiError(500, 'Failed to create group');
    }

    // 생성자를 리더로 group_members에 추가
    const { error: memberError } = await supabase.from('group_members').insert([
      {
        group_id: group.id,
        user_id: user.id,
        role: 'LEADER',
      },
    ]);

    if (memberError) {
      // 그룹 생성 롤백을 위해 삭제
      await supabase.from('groups').delete().eq('id', group.id);
      throw new ApiError(500, 'Failed to assign leader role');
    }

    const response: GroupResponse = {
      id: group.id,
      name: group.name,
      inviteCode: group.invite_code,
      createdAt: group.created_at,
    };

    return Response.json(response, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const supabase = createSupabaseServerClient();

    // 사용자가 소속된 그룹들 조회
    const { data: groups, error } = await supabase
      .from('groups')
      .select(
        `
        id,
        name,
        invite_code,
        created_at,
        group_members!inner(role)
      `
      )
      .eq('group_members.user_id', user.id);

    if (error) {
      throw new ApiError(500, 'Failed to fetch groups');
    }

    const response = groups.map((group: any) => ({
      id: group.id,
      name: group.name,
      inviteCode: group.invite_code,
      createdAt: group.created_at,
      role: group.group_members[0]?.role,
    }));

    return Response.json(response);
  } catch (error) {
    return createErrorResponse(error);
  }
}
