import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await req.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    // 프로필이 없는 경우 자동 생성
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // 프로필이 없으면 생성
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          nickname: user.user_metadata?.nickname || user.email || 'User',
          avatar_url: user.user_metadata?.avatar_url,
        });

      if (createProfileError) {
        console.error('Profile creation error:', createProfileError);
        return NextResponse.json(
          {
            error: 'Failed to create user profile',
            details: createProfileError,
          },
          { status: 500 }
        );
      }
    }

    // 그룹 생성
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (groupError) {
      console.error('Group creation error:', groupError);
      return NextResponse.json(
        {
          error: 'Failed to create group',
          details: groupError,
        },
        { status: 500 }
      );
    }

    // 생성자를 리더로 추가
    const { error: memberError } = await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: user.id,
      role: 'LEADER',
    });

    if (memberError) {
      console.error('Member creation error:', memberError);
      // 그룹은 생성되었지만 멤버 추가 실패 - 그룹 삭제
      await supabase.from('groups').delete().eq('id', group.id);
      return NextResponse.json(
        {
          error: 'Failed to add creator as leader',
          details: memberError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Group created successfully',
      group,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 사용자가 속한 그룹 목록 조회
    const { data: groups, error } = await supabase
      .from('groups')
      .select(
        `
        *,
        group_members!inner (
          user_id,
          role
        )
      `
      )
      .eq('group_members.user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Groups fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch groups' },
        { status: 500 }
      );
    }

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
