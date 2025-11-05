import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return errorResponse('Refresh token is required', 401);
    }

    const supabase = createClient();

    // Refresh the session using Supabase
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      return errorResponse('Invalid or expired refresh token', 401);
    }

    return successResponse({
      session: data.session,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return errorResponse('An error occurred while refreshing tokens', 500);
  }
}
