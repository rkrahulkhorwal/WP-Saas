import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '@/lib/api-response';
import { rsvpSchema } from '@/lib/validators';
import { ZodError } from 'zod';

// Public endpoint - submit RSVP (no auth required)
export async function POST(
  request: NextRequest,
  { params }: { params: { eventSlug: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { websiteSlug: params.eventSlug },
    });

    if (!event) {
      return notFoundResponse('Event not found');
    }

    if (!event.websiteEnabled) {
      return errorResponse('RSVP is not enabled for this event', 403);
    }

    const body = await request.json();
    const { email, ...rsvpData } = body;

    if (!email) {
      return errorResponse('Email is required for RSVP', 400);
    }

    // Validate RSVP data
    const validatedData = rsvpSchema.parse(rsvpData);

    // Find guest by email
    const guest = await prisma.guest.findFirst({
      where: {
        eventId: event.id,
        email: email,
      },
    });

    if (!guest) {
      return notFoundResponse('Guest not found. Please check your email address.');
    }

    // Update guest RSVP
    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        rsvpStatus: validatedData.rsvpStatus,
        rsvpDate: new Date(),
        dietaryRestrictions: validatedData.dietaryRestrictions,
      },
    });

    // Create notification for event owner
    await prisma.notification.create({
      data: {
        userId: event.userId,
        type: 'rsvp_received',
        title: 'New RSVP Response',
        message: `${guest.firstName} ${guest.lastName} has responded to your invitation with: ${validatedData.rsvpStatus}`,
        link: `/events/${event.id}/guests`,
      },
    });

    return successResponse(
      {
        guest: {
          firstName: updatedGuest.firstName,
          lastName: updatedGuest.lastName,
          rsvpStatus: updatedGuest.rsvpStatus,
        },
      },
      'RSVP submitted successfully'
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error.errors);
    }

    console.error('Submit RSVP error:', error);
    return errorResponse('An error occurred while submitting RSVP', 500);
  }
}
