import { createSupabaseServerClient } from './supabase-server';
import { ApiError } from './errors';

export interface AuthUser {
  id: string;
  email: string;
}

export async function requireAuth(request: Request): Promise<AuthUser> {
  try {
    const supabase = await createSupabaseServerClient();

    // 쿠키에서 사용자 정보 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new ApiError(401, 'Authentication required');
    }

    return {
      id: user.id,
      email: user.email || '',
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, 'Authentication failed');
  }
}
