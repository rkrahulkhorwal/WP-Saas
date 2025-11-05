import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware';
import { createTimelineItemSchema } from '@/lib/validators';
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

    const items = await prisma.timelineItem.findMany({
      where: { eventId: params.id },
      orderBy: { order: 'asc' },
    });

    return successResponse(items);
  } catch (error) {
    console.error('Get timeline error:', error);
    return errorResponse('An error occurred while fetching timeline', 500);
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
      return forbiddenResponse('You do not have permission to add items to this timeline');
    }

    const body = await request.json();
    const validatedData = createTimelineItemSchema.parse(body);

    const item = await prisma.timelineItem.create({
      data: {
        eventId: params.id,
        ...validatedData,
      },
    });

    return successResponse(item, 'Timeline item created successfully', 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error.errors);
    }

    console.error('Create timeline item error:', error);
    return errorResponse('An error occurred while creating the timeline item', 500);
  }
}
