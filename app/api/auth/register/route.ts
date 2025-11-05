import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/supabase/api-helpers';
import { registerSchema } from '@/lib/validators';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    const supabase = createClient();

    // Sign up with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          role: validatedData.role,
        },
      },
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        return errorResponse('User with this email already exists', 409);
      }
      return errorResponse(signUpError.message, 400);
    }

    if (!authData.user) {
      return errorResponse('Failed to create user', 500);
    }

    // Update user profile with phone if provided
    if (validatedData.phone) {
      await (supabase
        .from('users') as any)
        .update({ phone: validatedData.phone })
        .eq('id', authData.user.id);
    }

    // Create role-specific profile
    if (validatedData.role === 'COUPLE') {
      await (supabase
        .from('couple_profiles') as any)
        .insert({ user_id: authData.user.id });
    } else if (validatedData.role === 'PLANNER') {
      await (supabase
        .from('planner_profiles') as any)
        .insert({ user_id: authData.user.id });
    }

    // Get full user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone, role, avatar, is_verified, created_at')
      .eq('id', authData.user.id)
      .single();

    return successResponse(
      {
        user: userProfile,
        session: authData.session,
      },
      201
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.errors?.[0]?.message || 'Invalid request data';
      return validationErrorResponse(message);
    }

    console.error('Registration error:', error);
    return errorResponse('An error occurred during registration', 500);
  }
}
