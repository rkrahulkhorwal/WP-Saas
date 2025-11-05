import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response';
import { loginSchema } from '@/lib/validators';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(
      validatedData.password,
      user.password
    );

    if (!isValidPassword) {
      return errorResponse('Invalid email or password', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Return user data without password
    const { password, ...userWithoutPassword } = user;

    return successResponse({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    }, 'Login successful');
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error.errors);
    }

    console.error('Login error:', error);
    return errorResponse('An error occurred during login', 500);
  }
}
