import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createErrorResponse, ApiError } from '@/lib/errors';
import { UpdatePrayerRequest } from '@/types/prayer';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const supabase = createSupabaseServerClient();

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
          user_id,
          created_at,
          user:profiles(nickname)
        )
      `
      )
      .eq('id', id)
      .single();

    if (error || !prayer) {
      throw new ApiError(404, 'Prayer not found');
    }

    // 그룹 멤버십 확인 (같은 그룹 멤버만 조회 가능)
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
    const prayerWithReactions = {
      ...prayer,
      reaction_count: prayer.reactions?.length || 0,
    };

    return Response.json(prayerWithReactions);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const body: UpdatePrayerRequest = await request.json();

    const supabase = createSupabaseServerClient();

    // 기존 기도제목 조회
    const { data: existingPrayer, error: fetchError } = await supabase
      .from('prayers')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingPrayer) {
      throw new ApiError(404, 'Prayer not found');
    }

    // 작성자만 수정 가능
    if (existingPrayer.author_id !== user.id) {
      throw new ApiError(403, 'You can only edit your own prayers');
    }

    // 입력 검증
    const updateData: any = {};
    if (body.title !== undefined) {
      if (!body.title?.trim()) {
        throw new ApiError(400, 'Title cannot be empty');
      }
      if (body.title.length > 100) {
        throw new ApiError(400, 'Title must be 100 characters or less');
      }
      updateData.title = body.title.trim();
    }

    if (body.content !== undefined) {
      if (!body.content?.trim()) {
        throw new ApiError(400, 'Content cannot be empty');
      }
      if (body.content.length > 500) {
        throw new ApiError(400, 'Content must be 500 characters or less');
      }
      updateData.content = body.content.trim();
    }

    if (body.is_private !== undefined) {
      updateData.is_private = body.is_private;
    }

    // 기도제목 수정
    const { data: updatedPrayer, error } = await supabase
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

    if (error) {
      throw new ApiError(500, 'Failed to update prayer');
    }

    return Response.json(updatedPrayer);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const supabase = createSupabaseServerClient();

    // 기존 기도제목 조회
    const { data: existingPrayer, error: fetchError } = await supabase
      .from('prayers')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingPrayer) {
      throw new ApiError(404, 'Prayer not found');
    }

    // 작성자만 삭제 가능
    if (existingPrayer.author_id !== user.id) {
      throw new ApiError(403, 'You can only delete your own prayers');
    }

    // 기도제목 삭제 (CASCADE로 리액션도 함께 삭제됨)
    const { error } = await supabase.from('prayers').delete().eq('id', id);

    if (error) {
      throw new ApiError(500, 'Failed to delete prayer');
    }

    return Response.json({ message: 'Prayer deleted successfully' });
  } catch (error) {
    return createErrorResponse(error);
  }
}
