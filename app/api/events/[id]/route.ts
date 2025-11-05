import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware';
import { updateEventSchema } from '@/lib/validators';
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
      include: {
        planner: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            guests: true,
            tasks: true,
            expenses: true,
            bookings: true,
          },
        },
      },
    });

    if (!event) {
      return notFoundResponse('Event not found');
    }

    // Check if user has access to this event
    if (event.userId !== authResult.user.userId) {
      return forbiddenResponse('You do not have access to this event');
    }

    return successResponse(event);
  } catch (error) {
    console.error('Get event error:', error);
    return errorResponse('An error occurred while fetching the event', 500);
  }
}

export async function PATCH(
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
      return forbiddenResponse('You do not have permission to update this event');
    }

    const body = await request.json();
    const validatedData = updateEventSchema.parse(body);

    const updateData: any = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.type !== undefined) updateData.type = validatedData.type;
    if (validatedData.date !== undefined) updateData.date = new Date(validatedData.date);
    if (validatedData.time !== undefined) updateData.time = validatedData.time;
    if (validatedData.venue !== undefined) updateData.venue = validatedData.venue;
    if (validatedData.venueAddress !== undefined) updateData.venueAddress = validatedData.venueAddress;
    if (validatedData.budget !== undefined) updateData.budget = validatedData.budget;
    if (validatedData.guestCount !== undefined) updateData.guestCount = validatedData.guestCount;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.partner1Name !== undefined) updateData.partner1Name = validatedData.partner1Name;
    if (validatedData.partner2Name !== undefined) updateData.partner2Name = validatedData.partner2Name;

    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data: updateData,
    });

    return successResponse(updatedEvent, 'Event updated successfully');
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error.errors);
    }

    console.error('Update event error:', error);
    return errorResponse('An error occurred while updating the event', 500);
  }
}

export async function DELETE(
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
      return forbiddenResponse('You do not have permission to delete this event');
    }

    await prisma.event.delete({
      where: { id: params.id },
    });

    return successResponse(null, 'Event deleted successfully');
  } catch (error) {
    console.error('Delete event error:', error);
    return errorResponse('An error occurred while deleting the event', 500);
  }
}
