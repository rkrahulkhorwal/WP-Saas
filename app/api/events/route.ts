import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware';
import { createEventSchema } from '@/lib/validators';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (!authResult.success) {
      return authResult.response;
    }

    const events = await prisma.event.findMany({
      where: { userId: authResult.user.userId },
      include: {
        _count: {
          select: {
            guests: true,
            tasks: true,
            expenses: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    return successResponse(events);
  } catch (error) {
    console.error('Get events error:', error);
    return errorResponse('An error occurred while fetching events', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (!authResult.success) {
      return authResult.response;
    }

    const body = await request.json();
    const validatedData = createEventSchema.parse(body);

    // Generate a unique website slug if not provided
    let websiteSlug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Ensure slug is unique
    let slugExists = await prisma.event.findUnique({
      where: { websiteSlug },
    });

    let counter = 1;
    const baseSlug = websiteSlug;
    while (slugExists) {
      websiteSlug = `${baseSlug}-${counter}`;
      slugExists = await prisma.event.findUnique({
        where: { websiteSlug },
      });
      counter++;
    }

    const event = await prisma.event.create({
      data: {
        userId: authResult.user.userId,
        name: validatedData.name,
        type: validatedData.type,
        date: new Date(validatedData.date),
        time: validatedData.time,
        venue: validatedData.venue,
        venueAddress: validatedData.venueAddress,
        budget: validatedData.budget,
        guestCount: validatedData.guestCount,
        description: validatedData.description,
        partner1Name: validatedData.partner1Name,
        partner2Name: validatedData.partner2Name,
        websiteSlug,
      },
      include: {
        _count: {
          select: {
            guests: true,
            tasks: true,
            expenses: true,
          },
        },
      },
    });

    return successResponse(event, 'Event created successfully', 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error.errors);
    }

    console.error('Create event error:', error);
    return errorResponse('An error occurred while creating the event', 500);
  }
}
