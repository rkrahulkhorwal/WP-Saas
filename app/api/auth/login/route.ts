import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/supabase/api-helpers';
import { loginSchema } from '@/lib/validators';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    const supabase = createClient();

    // Sign in with Supabase Auth
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (signInError) {
      return errorResponse('Invalid email or password', 401);
    }

    if (!authData.user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Get full user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone, role, avatar, is_verified, created_at, updated_at')
      .eq('id', authData.user.id)
      .single();

    return successResponse({
      user: userProfile,
      session: authData.session,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.errors?.[0]?.message || 'Invalid request data';
      return validationErrorResponse(message);
    }

    console.error('Login error:', error);
    return errorResponse('An error occurred during login', 500);
  }
}
