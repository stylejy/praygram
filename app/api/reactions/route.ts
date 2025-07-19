import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createErrorResponse, ApiError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { prayer_id, type = 'pray' } = await request.json();

    // 입력 검증
    if (!prayer_id) {
      throw new ApiError(400, 'Prayer ID is required');
    }
    if (type !== 'pray' && type !== 'amen') {
      throw new ApiError(400, 'Invalid reaction type');
    }

    const supabase = await createSupabaseServerClient();

    // 기도제목 조회 및 그룹 멤버십 확인
    const { data: prayer, error: prayerError } = await supabase
      .from('prayers')
      .select('group_id')
      .eq('id', prayer_id)
      .single();

    if (prayerError || !prayer) {
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

    // 리액션 추가 (UNIQUE 제약조건으로 중복 방지)
    const { data: reaction, error } = await supabase
      .from('reactions')
      .insert([
        {
          prayer_id,
          user_id: user.id,
          type,
        },
      ])
      .select(
        `
        *,
        user:profiles(nickname)
      `
      )
      .single();

    if (error) {
      // 중복 리액션인 경우
      if (error.code === '23505') {
        throw new ApiError(409, 'You have already reacted to this prayer');
      }
      console.error('Reaction creation error:', error);
      throw new ApiError(500, 'Failed to add reaction');
    }

    return Response.json(reaction, { status: 201 });
  } catch (error) {
    console.error('Reaction creation API error:', error);
    return createErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const prayer_id = searchParams.get('prayer_id');
    const type = searchParams.get('type') || 'pray';

    if (!prayer_id) {
      throw new ApiError(400, 'Prayer ID is required');
    }

    const supabase = await createSupabaseServerClient();

    // 기도제목 조회 및 그룹 멤버십 확인
    const { data: prayer, error: prayerError } = await supabase
      .from('prayers')
      .select('group_id')
      .eq('id', prayer_id)
      .single();

    if (prayerError || !prayer) {
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

    // 리액션 삭제
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('prayer_id', prayer_id)
      .eq('user_id', user.id)
      .eq('type', type);

    if (error) {
      console.error('Reaction deletion error:', error);
      throw new ApiError(500, 'Failed to remove reaction');
    }

    return Response.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    console.error('Reaction deletion API error:', error);
    return createErrorResponse(error);
  }
}
