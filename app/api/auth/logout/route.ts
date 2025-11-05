import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      return errorResponse('Failed to log out', 500);
    }

    return successResponse({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse('An error occurred during logout', 500);
  }
}
