import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createErrorResponse, ApiError } from '@/lib/errors';

interface CreatePrayerRequest {
  title: string;
  content: string;
  group_id: string;
  is_private?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      throw new ApiError(400, 'Group ID is required');
    }

    const supabase = await createSupabaseServerClient();

    // 그룹 멤버십 확인
    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      throw new ApiError(403, 'You are not a member of this group');
    }

    // 기도제목 조회 (최신순)
    const { data: prayers, error } = await supabase
      .from('prayers')
      .select(
        `
        *,
        author:profiles(nickname),
        reactions(
          id,
          type,
          user_id
        )
      `
      )
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Prayers fetch error:', error);
      throw new ApiError(500, 'Failed to fetch prayers');
    }

    // 리액션 카운트 추가
    const prayersWithReactionCount = prayers.map((prayer) => ({
      ...prayer,
      reaction_count: prayer.reactions?.length || 0,
    }));

    return Response.json(prayersWithReactionCount);
  } catch (error) {
    console.error('Prayers fetch API error:', error);
    return createErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body: CreatePrayerRequest = await request.json();

    // 입력 검증
    if (!body.title?.trim()) {
      throw new ApiError(400, 'Title is required');
    }
    if (!body.content?.trim()) {
      throw new ApiError(400, 'Content is required');
    }
    if (!body.group_id) {
      throw new ApiError(400, 'Group ID is required');
    }
    if (body.title.length > 100) {
      throw new ApiError(400, 'Title must be 100 characters or less');
    }
    if (body.content.length > 500) {
      throw new ApiError(400, 'Content must be 500 characters or less');
    }

    const supabase = await createSupabaseServerClient();

    // 그룹 멤버십 확인
    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', body.group_id)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      throw new ApiError(403, 'You are not a member of this group');
    }

    // 기도제목 생성
    const { data: prayer, error } = await supabase
      .from('prayers')
      .insert([
        {
          title: body.title.trim(),
          content: body.content.trim(),
          group_id: body.group_id,
          author_id: user.id,
          is_private: body.is_private || false,
        },
      ])
      .select(
        `
        *,
        author:profiles(nickname)
      `
      )
      .single();

    if (error) {
      console.error('Prayer creation error:', error);
      throw new ApiError(500, 'Failed to create prayer');
    }

    return Response.json(prayer, { status: 201 });
  } catch (error) {
    console.error('Prayer creation API error:', error);
    return createErrorResponse(error);
  }
}
