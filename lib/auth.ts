import { createSupabaseBrowserClient } from './supabase';
import { ApiError } from './errors';

export interface AuthUser {
  id: string;
  email: string;
}

export async function verifyToken(authHeader?: string): Promise<AuthUser> {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authorization header missing or invalid');
  }

  const token = authHeader.split(' ')[1];
  const supabase = createSupabaseBrowserClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new ApiError(401, 'Invalid or expired token');
    }

    return {
      id: user.id,
      email: user.email || '',
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, 'Token verification failed');
  }
}

export async function requireAuth(request: Request): Promise<AuthUser> {
  const authHeader = request.headers.get('Authorization');
  return verifyToken(authHeader ?? undefined);
}
