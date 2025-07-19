import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface Member {
  id: string;
  nickname: string;
  group: string | null;
  is_manager: boolean;
  created_at: string;
  updated_at: string;
}

// 기존 사용자 프로필 조회
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || user.id;

    // 프로필 조회
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 프로필이 없는 경우
        return NextResponse.json([]);
      }
      throw error;
    }

    // 그룹 멤버십 정보 조회
    const { data: membership } = await supabase
      .from('group_members')
      .select(
        `
        group_id,
        role,
        groups!inner(id, name)
      `
      )
      .eq('user_id', userId)
      .single();

    const member: Member = {
      id: profile.id,
      nickname: profile.nickname,
      group: membership?.group_id || null,
      is_manager: membership?.role === 'LEADER',
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };

    return NextResponse.json([member]);
  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 새 사용자 프로필 생성
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nickname } = await request.json();

    if (!nickname) {
      return NextResponse.json(
        { error: 'Nickname is required' },
        { status: 400 }
      );
    }

    // 프로필이 이미 존재하는지 확인
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists' },
        { status: 409 }
      );
    }

    // 새 프로필 생성
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          nickname,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    const member = {
      id: profile.id,
      nickname: profile.nickname,
      group: null,
      is_manager: false,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 멤버 정보 업데이트 (그룹 정보 등)
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId, isManager } = await request.json();

    // 프로필 존재 확인
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 그룹 멤버십 정보 조회
    const { data: membership } = await supabase
      .from('group_members')
      .select(
        `
        group_id,
        role,
        groups!inner(id, name)
      `
      )
      .eq('user_id', user.id)
      .single();

    const member: Member = {
      id: profile.id,
      nickname: profile.nickname,
      group: groupId || membership?.group_id || null,
      is_manager:
        isManager !== undefined ? isManager : membership?.role === 'LEADER',
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
