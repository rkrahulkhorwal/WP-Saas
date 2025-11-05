import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

// Public endpoint - get event info for RSVP (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: { eventSlug: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { websiteSlug: params.eventSlug },
      select: {
        id: true,
        name: true,
        date: true,
        time: true,
        venue: true,
        venueAddress: true,
        partner1Name: true,
        partner2Name: true,
        couplePhoto: true,
        websiteEnabled: true,
      },
    });

    if (!event) {
      return notFoundResponse('Event not found');
    }

    if (!event.websiteEnabled) {
      return errorResponse('RSVP is not enabled for this event', 403);
    }

    return successResponse(event);
  } catch (error) {
    console.error('Get RSVP event error:', error);
    return errorResponse('An error occurred while fetching event details', 500);
  }
}
