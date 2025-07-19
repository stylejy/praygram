import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface Member {
  id: string;
  nickname: string;
  group_id: string | null;
  is_manager: boolean;
  created_at: string;
  updated_at: string;
}

// 사용자 정보 조회
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

    // URL에서 userId 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // 요청한 사용자 ID와 현재 로그인한 사용자가 같은지 확인
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // profiles 테이블에서 사용자 정보 조회
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, nickname, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 프로필이 없으면 빈 배열 반환
        return NextResponse.json([]);
      }
      throw error;
    }

    // group_members 테이블에서 그룹 정보 조회
    const { data: groupMember } = await supabase
      .from('group_members')
      .select('group_id, is_manager')
      .eq('user_id', userId)
      .single();

    const member = {
      id: profile.id,
      nickname: profile.nickname,
      group: groupMember?.group_id || null,
      is_manager: groupMember?.is_manager || false,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };

    return NextResponse.json([member]);
  } catch (error) {
    console.error('Error getting member:', error);
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
