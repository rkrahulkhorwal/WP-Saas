import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minRating = searchParams.get('minRating');

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }

    const vendors = await prisma.vendorProfile.findMany({
      where,
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
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' },
      ],
    });

    return successResponse(vendors);
  } catch (error) {
    console.error('Get vendors error:', error);
    return errorResponse('An error occurred while fetching vendors', 500);
  }
}
