import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware';
import { createChecklistItemSchema } from '@/lib/validators';
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

    const items = await prisma.checklistItem.findMany({
      where: { eventId: params.id },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });

    // Group by category
    const grouped = items.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, typeof items>);

    return successResponse({
      items,
      grouped,
      stats: {
        total: items.length,
        completed: items.filter((i) => i.isCompleted).length,
      },
    });
  } catch (error) {
    console.error('Get checklist error:', error);
    return errorResponse('An error occurred while fetching checklist', 500);
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
      return forbiddenResponse('You do not have permission to add items to this checklist');
    }

    const body = await request.json();
    const validatedData = createChecklistItemSchema.parse(body);

    const item = await prisma.checklistItem.create({
      data: {
        eventId: params.id,
        ...validatedData,
      },
    });

    return successResponse(item, 'Checklist item created successfully', 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error.errors);
    }

    console.error('Create checklist item error:', error);
    return errorResponse('An error occurred while creating the checklist item', 500);
  }
}
