import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, requireAuth } from '@/lib/supabase/api-helpers';
import { Database } from '@/lib/supabase/types';

// Define the type for the user profile response with nested relationships
type UserProfileResponse = Database['public']['Tables']['users']['Row'] & {
  couple_profiles: Database['public']['Tables']['couple_profiles']['Row'][];
  planner_profiles: Database['public']['Tables']['planner_profiles']['Row'][];
  vendor_profiles: Database['public']['Tables']['vendor_profiles']['Row'][];
};

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth();

    if (authError || !user) {
      return authError || errorResponse('Authentication required', 401);
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
      .eq('id', user.id)
      .single();

    if (!userProfile) {
      return errorResponse('User not found', 404);
    }

    // Type assertion to inform TypeScript of the actual return type
    const typedUserProfile = userProfile as UserProfileResponse;

    return successResponse(typedUserProfile);
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse('An error occurred while fetching user data', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth();

    if (authError || !user) {
      return authError || errorResponse('Authentication required', 401);
    }

    const body = await request.json();
    const { firstName, lastName, phone, avatar } = body;

    const supabase = createClient();

    const updateData: any = {};
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;

    const { data: updatedUser, error: updateError } = await (supabase
      .from('users') as any)
      .update(updateData)
      .eq('id', user.id)
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
