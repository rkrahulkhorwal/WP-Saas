import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response';
import { registerSchema } from '@/lib/validators';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return errorResponse('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        role: validatedData.role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    // Create role-specific profile
    if (validatedData.role === 'COUPLE') {
      await prisma.coupleProfile.create({
        data: { userId: user.id },
      });
    } else if (validatedData.role === 'PLANNER') {
      await prisma.plannerProfile.create({
        data: { userId: user.id },
      });
    }

    // Generate tokens
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    const accessToken = generateAccessToken(fullUser!);
    const refreshToken = generateRefreshToken(fullUser!);

    return successResponse(
      {
        user,
        accessToken,
        refreshToken,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error.errors);
    }

    console.error('Registration error:', error);
    return errorResponse('An error occurred during registration', 500);
  }
}
