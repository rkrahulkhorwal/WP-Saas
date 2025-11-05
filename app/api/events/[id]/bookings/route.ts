import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware';
import { createBookingSchema } from '@/lib/validators';
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

    const bookings = await prisma.booking.findMany({
      where: { eventId: params.id },
      include: {
        vendor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        contract: true,
      },
      orderBy: { serviceDate: 'asc' },
    });

    return successResponse(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    return errorResponse('An error occurred while fetching bookings', 500);
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
      return forbiddenResponse('You do not have permission to add bookings to this event');
    }

    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    // Verify vendor exists
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: validatedData.vendorId },
    });

    if (!vendor) {
      return notFoundResponse('Vendor not found');
    }

    const bookingData: any = {
      eventId: params.id,
      vendorId: validatedData.vendorId,
      serviceDate: new Date(validatedData.serviceDate),
      serviceDetails: validatedData.serviceDetails,
      agreedPrice: validatedData.agreedPrice,
      depositPaid: validatedData.depositPaid,
      notes: validatedData.notes,
    };

    if (validatedData.depositDueDate) {
      bookingData.depositDueDate = new Date(validatedData.depositDueDate);
    }

    if (validatedData.finalPaymentDue) {
      bookingData.finalPaymentDue = new Date(validatedData.finalPaymentDue);
    }

    const booking = await prisma.booking.create({
      data: bookingData,
      include: {
        vendor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Create notification for vendor
    await prisma.notification.create({
      data: {
        userId: vendor.userId,
        type: 'booking_request',
        title: 'New Booking Request',
        message: `You have a new booking request for ${event.name}`,
        link: `/bookings/${booking.id}`,
      },
    });

    return successResponse(booking, 'Booking created successfully', 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error.errors);
    }

    console.error('Create booking error:', error);
    return errorResponse('An error occurred while creating the booking', 500);
  }
}
