import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createErrorResponse, ApiError } from '@/lib/errors';

interface Props {
  params: Promise<{ id: string }>;
}

interface UpdatePrayerRequest {
  title?: string;
  content?: string;
  is_private?: boolean;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const user = await requireAuth(request);
    const supabase = await createSupabaseServerClient();

    // 기도제목 조회
    const { data: prayer, error } = await supabase
      .from('prayers')
      .select(
        `
        *,
        author:profiles(nickname),
        reactions(
          id,
          type,
          user:profiles(nickname)
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      console.error('Prayer fetch error:', error);
      throw new ApiError(404, 'Prayer not found');
    }

    // 그룹 멤버십 확인
    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', prayer.group_id)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      throw new ApiError(403, 'You are not a member of this group');
    }

    // 리액션 카운트 계산
    const reactionCount = prayer.reactions?.length || 0;

    const response = {
      ...prayer,
      reaction_count: reactionCount,
    };

    return Response.json(response);
  } catch (error) {
    console.error('Prayer fetch API error:', error);
    return createErrorResponse(error);
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const user = await requireAuth(request);
    const body: UpdatePrayerRequest = await request.json();
    const supabase = await createSupabaseServerClient();

    // 기도제목 조회 및 작성자 확인
    const { data: prayer, error: prayerError } = await supabase
      .from('prayers')
      .select('author_id, group_id')
      .eq('id', id)
      .single();

    if (prayerError || !prayer) {
      throw new ApiError(404, 'Prayer not found');
    }

    if (prayer.author_id !== user.id) {
      throw new ApiError(403, 'You can only edit your own prayers');
    }

    // 업데이트할 필드 준비
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.content !== undefined) updateData.content = body.content.trim();
    if (body.is_private !== undefined) updateData.is_private = body.is_private;

    // 업데이트 실행
    const { data: updatedPrayer, error: updateError } = await supabase
      .from('prayers')
      .update(updateData)
      .eq('id', id)
      .select(
        `
        *,
        author:profiles(nickname)
      `
      )
      .single();

    if (updateError) {
      console.error('Prayer update error:', updateError);
      throw new ApiError(500, 'Failed to update prayer');
    }

    return Response.json(updatedPrayer);
  } catch (error) {
    console.error('Prayer update API error:', error);
    return createErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const user = await requireAuth(request);
    const supabase = await createSupabaseServerClient();

    // 기도제목 조회 및 작성자 확인
    const { data: prayer, error: prayerError } = await supabase
      .from('prayers')
      .select('author_id, group_id')
      .eq('id', id)
      .single();

    if (prayerError || !prayer) {
      throw new ApiError(404, 'Prayer not found');
    }

    // 작성자이거나 그룹 리더인지 확인
    const isAuthor = prayer.author_id === user.id;
    let isLeader = false;

    if (!isAuthor) {
      const { data: membership } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', prayer.group_id)
        .eq('user_id', user.id)
        .single();

      isLeader = membership?.role === 'LEADER';
    }

    if (!isAuthor && !isLeader) {
      throw new ApiError(
        403,
        'You can only delete your own prayers or as a group leader'
      );
    }

    // 삭제 실행 (CASCADE로 관련 리액션도 삭제됨)
    const { error: deleteError } = await supabase
      .from('prayers')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Prayer deletion error:', deleteError);
      throw new ApiError(500, 'Failed to delete prayer');
    }

    return Response.json({ message: 'Prayer deleted successfully' });
  } catch (error) {
    console.error('Prayer deletion API error:', error);
    return createErrorResponse(error);
  }
}
