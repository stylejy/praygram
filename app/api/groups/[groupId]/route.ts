import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

interface Props {
  params: Promise<{ groupId: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const { groupId } = await params;
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 사용자가 해당 그룹의 멤버인지 확인하면서 그룹 정보 조회
    const { data: group, error } = await supabase
      .from('groups')
      .select(
        `
        id,
        name,
        description,
        created_at,
        created_by,
        group_members!inner (
          user_id,
          role
        )
      `
      )
      .eq('id', groupId)
      .eq('group_members.user_id', user.id)
      .single();

    if (error) {
      console.error('Group fetch error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            error: 'Group not found or access denied',
          },
          { status: 404 }
        );
      }
      return NextResponse.json(
        {
          error: 'Failed to fetch group',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
