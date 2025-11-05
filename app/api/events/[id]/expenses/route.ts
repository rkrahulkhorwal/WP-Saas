import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware';
import { createExpenseSchema } from '@/lib/validators';
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

    const expenses = await prisma.expense.findMany({
      where: { eventId: params.id },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate budget summary
    const summary = expenses.reduce(
      (acc: any, expense: any) => {
        acc.totalEstimated += expense.estimatedCost;
        acc.totalActual += expense.actualCost || 0;
        acc.totalPaid += expense.paidAmount;
        return acc;
      },
      { totalEstimated: 0, totalActual: 0, totalPaid: 0 }
    );

    return successResponse({
      expenses,
      summary: {
        ...summary,
        totalBudget: event.budget || 0,
        remaining: (event.budget || 0) - summary.totalEstimated,
      },
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    return errorResponse('An error occurred while fetching expenses', 500);
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
      return forbiddenResponse('You do not have permission to add expenses to this event');
    }

    const body = await request.json();
    const validatedData = createExpenseSchema.parse(body);

    const expenseData: any = {
      eventId: params.id,
      name: validatedData.name,
      category: validatedData.category,
      estimatedCost: validatedData.estimatedCost,
      paidAmount: validatedData.paidAmount,
      vendor: validatedData.vendor,
      notes: validatedData.notes,
    };

    if (validatedData.actualCost !== undefined) {
      expenseData.actualCost = validatedData.actualCost;
    }

    if (validatedData.dueDate) {
      expenseData.dueDate = new Date(validatedData.dueDate);
    }

    const expense = await prisma.expense.create({
      data: expenseData,
    });

    return successResponse(expense, 'Expense created successfully', 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error.errors);
    }

    console.error('Create expense error:', error);
    return errorResponse('An error occurred while creating the expense', 500);
  }
}
