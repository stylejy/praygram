import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createErrorResponse, ApiError } from '@/lib/errors';

interface JoinGroupRequest {
  groupId: string;
}

interface JoinGroupResponse {
  groupId: string;
  groupName: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { groupId }: JoinGroupRequest = await request.json();

    if (!groupId?.trim()) {
      throw new ApiError(400, 'Group ID is required');
    }

    const supabase = await createSupabaseServerClient();

    // 그룹 존재 확인 (ID로만 조회)
    console.log('그룹 조회 시도 - groupId:', groupId.trim());

    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, name')
      .eq('id', groupId.trim())
      .single();

    if (groupError || !group) {
      console.error('그룹 조회 실패:', groupError);
      console.error('조회 시도한 ID:', groupId.trim());
      throw new ApiError(404, 'Group not found');
    }

    console.log('그룹 조회 성공:', group);

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
      console.error('Member insertion error:', memberError);
      throw new ApiError(500, 'Failed to join group');
    }

    const response: JoinGroupResponse = {
      groupId: group.id,
      groupName: group.name,
      role: 'MEMBER',
    };

    return Response.json(response, { status: 201 });
  } catch (error) {
    console.error('Group join API error:', error);
    return createErrorResponse(error);
  }
}
