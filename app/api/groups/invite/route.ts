import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createErrorResponse, ApiError } from '@/lib/errors';

interface JoinGroupRequest {
  inviteCode: string;
}

interface JoinGroupResponse {
  groupId: string;
  groupName: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { inviteCode }: JoinGroupRequest = await request.json();

    if (!inviteCode?.trim()) {
      throw new ApiError(400, 'Invite code is required');
    }

    const supabase = createSupabaseServerClient();

    // 초대 코드로 그룹 찾기
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, name')
      .eq('invite_code', inviteCode.trim())
      .single();

    if (groupError || !group) {
      throw new ApiError(404, 'Invalid invite code');
    }

    // 이미 해당 그룹의 멤버인지 확인
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', group.id)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      return Response.json({
        groupId: group.id,
        groupName: group.name,
        role: existingMember.role,
      });
    }

    // 새 멤버로 추가
    const { error: memberError } = await supabase.from('group_members').insert([
      {
        group_id: group.id,
        user_id: user.id,
        role: 'MEMBER',
      },
    ]);

    if (memberError) {
      throw new ApiError(500, 'Failed to join group');
    }

    const response: JoinGroupResponse = {
      groupId: group.id,
      groupName: group.name,
      role: 'MEMBER',
    };

    return Response.json(response, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
