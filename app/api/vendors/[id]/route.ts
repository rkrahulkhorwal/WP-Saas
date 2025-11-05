import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!vendor) {
      return notFoundResponse('Vendor not found');
    }

    return successResponse(vendor);
  } catch (error) {
    console.error('Get vendor error:', error);
    return errorResponse('An error occurred while fetching vendor details', 500);
  }
}
