import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware';
import { updateGuestSchema } from '@/lib/validators';
import { ZodError } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; guestId: string } }
) {
  try {
    const authResult = await requireAuth(request);

    if (!authResult.success) {
      return authResult.response;
    }

    const guest = await prisma.guest.findUnique({
      where: { id: params.guestId },
      include: {
        event: true,
      },
    });

    if (!guest) {
      return notFoundResponse('Guest not found');
    }

    if (guest.event.userId !== authResult.user.userId) {
      return forbiddenResponse('You do not have access to this guest');
    }

    return successResponse(guest);
  } catch (error) {
    console.error('Get guest error:', error);
    return errorResponse('An error occurred while fetching the guest', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; guestId: string } }
) {
  try {
    const authResult = await requireAuth(request);

    if (!authResult.success) {
      return authResult.response;
    }

    const guest = await prisma.guest.findUnique({
      where: { id: params.guestId },
      include: {
        event: true,
      },
    });

    if (!guest) {
      return notFoundResponse('Guest not found');
    }

    if (guest.event.userId !== authResult.user.userId) {
      return forbiddenResponse('You do not have permission to update this guest');
    }

    const body = await request.json();
    const validatedData = updateGuestSchema.parse(body);

    const updatedGuest = await prisma.guest.update({
      where: { id: params.guestId },
      data: validatedData,
    });

    return successResponse(updatedGuest, 'Guest updated successfully');
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error.errors);
    }

    console.error('Update guest error:', error);
    return errorResponse('An error occurred while updating the guest', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; guestId: string } }
) {
  try {
    const authResult = await requireAuth(request);

    if (!authResult.success) {
      return authResult.response;
    }

    const guest = await prisma.guest.findUnique({
      where: { id: params.guestId },
      include: {
        event: true,
      },
    });

    if (!guest) {
      return notFoundResponse('Guest not found');
    }

    if (guest.event.userId !== authResult.user.userId) {
      return forbiddenResponse('You do not have permission to delete this guest');
    }

    await prisma.guest.delete({
      where: { id: params.guestId },
    });

    return successResponse(null, 'Guest deleted successfully');
  } catch (error) {
    console.error('Delete guest error:', error);
    return errorResponse('An error occurred while deleting the guest', 500);
  }
}
