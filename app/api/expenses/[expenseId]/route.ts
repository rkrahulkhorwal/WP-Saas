import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware';
import { updateExpenseSchema } from '@/lib/validators';
import { ZodError } from 'zod';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { expenseId: string } }
) {
  try {
    const authResult = await requireAuth(request);

    if (!authResult.success) {
      return authResult.response;
    }

    const expense = await prisma.expense.findUnique({
      where: { id: params.expenseId },
      include: {
        event: true,
      },
    });

    if (!expense) {
      return notFoundResponse('Expense not found');
    }

    if (expense.event.userId !== authResult.user.userId) {
      return forbiddenResponse('You do not have permission to update this expense');
    }

    const body = await request.json();
    const validatedData = updateExpenseSchema.parse(body);

    const updateData: any = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.category !== undefined) updateData.category = validatedData.category;
    if (validatedData.estimatedCost !== undefined) updateData.estimatedCost = validatedData.estimatedCost;
    if (validatedData.actualCost !== undefined) updateData.actualCost = validatedData.actualCost;
    if (validatedData.paidAmount !== undefined) updateData.paidAmount = validatedData.paidAmount;
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
      if (validatedData.status === 'PAID') {
        updateData.paidDate = new Date();
      }
    }
    if (validatedData.vendor !== undefined) updateData.vendor = validatedData.vendor;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;
    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null;
    }

    const updatedExpense = await prisma.expense.update({
      where: { id: params.expenseId },
      data: updateData,
    });

    return successResponse(updatedExpense, 'Expense updated successfully');
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error.errors);
    }

    console.error('Update expense error:', error);
    return errorResponse('An error occurred while updating the expense', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { expenseId: string } }
) {
  try {
    const authResult = await requireAuth(request);

    if (!authResult.success) {
      return authResult.response;
    }

    const expense = await prisma.expense.findUnique({
      where: { id: params.expenseId },
      include: {
        event: true,
      },
    });

    if (!expense) {
      return notFoundResponse('Expense not found');
    }

    if (expense.event.userId !== authResult.user.userId) {
      return forbiddenResponse('You do not have permission to delete this expense');
    }

    await prisma.expense.delete({
      where: { id: params.expenseId },
    });

    return successResponse(null, 'Expense deleted successfully');
  } catch (error) {
    console.error('Delete expense error:', error);
    return errorResponse('An error occurred while deleting the expense', 500);
  }
}
