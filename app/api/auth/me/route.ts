import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, requireAuth } from '@/lib/supabase/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth();

    if (authError) {
      return authError;
    }

    const supabase = createClient();

    // Get user with profiles
    const { data: userProfile } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        role,
        avatar,
        is_verified,
        created_at,
        couple_profiles (*),
        planner_profiles (*),
        vendor_profiles (*)
      `)
      .eq('id', user!.id)
      .single();

    if (!userProfile) {
      return errorResponse('User not found', 404);
    }

    return successResponse(userProfile);
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse('An error occurred while fetching user data', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth();

    if (authError) {
      return authError;
    }

    const body = await request.json();
    const { firstName, lastName, phone, avatar } = body;

    const supabase = createClient();

    const updateData: any = {};
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user!.id)
      .select('id, email, first_name, last_name, phone, role, avatar, is_verified')
      .single();

    if (updateError) {
      return errorResponse('Failed to update profile', 500);
    }

    return successResponse(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    return errorResponse('An error occurred while updating profile', 500);
  }
}
