import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware';
import { createGuestSchema } from '@/lib/validators';
import { ZodError } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request);

    if (!authResult.success) {
      return authResult.response;
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return notFoundResponse('Event not found');
    }

    if (event.userId !== authResult.user.userId) {
      return forbiddenResponse('You do not have access to this event');
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const rsvpStatus = searchParams.get('rsvpStatus');

    const where: any = { eventId: params.id };

    if (category) {
      where.category = category;
    }

    if (rsvpStatus) {
      where.rsvpStatus = rsvpStatus;
    }

    const guests = await prisma.guest.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    // Get statistics
    const stats = await prisma.guest.groupBy({
      by: ['rsvpStatus'],
      where: { eventId: params.id },
      _count: true,
    });

    return successResponse({
      guests,
      stats: {
        total: guests.length,
        byStatus: stats.reduce((acc: any, stat: any) => {
          acc[stat.rsvpStatus] = stat._count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error('Get guests error:', error);
    return errorResponse('An error occurred while fetching guests', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request);

    if (!authResult.success) {
      return authResult.response;
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return notFoundResponse('Event not found');
    }

    if (event.userId !== authResult.user.userId) {
      return forbiddenResponse('You do not have permission to add guests to this event');
    }

    const body = await request.json();
    const validatedData = createGuestSchema.parse(body);

    const guest = await prisma.guest.create({
      data: {
        eventId: params.id,
        ...validatedData,
      },
    });

    return successResponse(guest, 'Guest added successfully', 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error.errors);
    }

    console.error('Create guest error:', error);
    return errorResponse('An error occurred while adding the guest', 500);
  }
}
