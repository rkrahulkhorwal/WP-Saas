import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return unauthorizedResponse('Refresh token is required');
    }

    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      return unauthorizedResponse('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    return successResponse({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }, 'Tokens refreshed successfully');
  } catch (error) {
    console.error('Token refresh error:', error);
    return errorResponse('An error occurred while refreshing tokens', 500);
  }
}
