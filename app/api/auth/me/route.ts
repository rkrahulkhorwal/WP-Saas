import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { authenticate } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticate(request);

    if (!authResult.success) {
      return authResult.response;
    }

    const user = await prisma.user.findUnique({
      where: { id: authResult.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        coupleProfile: true,
        plannerProfile: true,
        vendorProfile: true,
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user);
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse('An error occurred while fetching user data', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await authenticate(request);

    if (!authResult.success) {
      return authResult.response;
    }

    const body = await request.json();
    const { firstName, lastName, phone, avatar } = body;

    const updatedUser = await prisma.user.update({
      where: { id: authResult.user.userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatar: true,
        isVerified: true,
      },
    });

    return successResponse(updatedUser, 'Profile updated successfully');
  } catch (error) {
    console.error('Update user error:', error);
    return errorResponse('An error occurred while updating profile', 500);
  }
}
