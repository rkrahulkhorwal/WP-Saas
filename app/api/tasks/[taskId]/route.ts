import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware';
import { updateTaskSchema } from '@/lib/validators';
import { ZodError } from 'zod';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const authResult = await requireAuth(request);

    if (!authResult.success) {
      return authResult.response;
    }

    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
      include: {
        event: true,
      },
    });

    if (!task) {
      return notFoundResponse('Task not found');
    }

    if (task.event.userId !== authResult.user.userId) {
      return forbiddenResponse('You do not have permission to update this task');
    }

    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    const updateData: any = {};

    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority;
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
      if (validatedData.status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    }
    if (validatedData.category !== undefined) updateData.category = validatedData.category;
    if (validatedData.assignedToId !== undefined) updateData.assignedToId = validatedData.assignedToId;
    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null;
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.taskId },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return successResponse(updatedTask, 'Task updated successfully');
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error.errors);
    }

    console.error('Update task error:', error);
    return errorResponse('An error occurred while updating the task', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const authResult = await requireAuth(request);

    if (!authResult.success) {
      return authResult.response;
    }

    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
      include: {
        event: true,
      },
    });

    if (!task) {
      return notFoundResponse('Task not found');
    }

    if (task.event.userId !== authResult.user.userId) {
      return forbiddenResponse('You do not have permission to delete this task');
    }

    await prisma.task.delete({
      where: { id: params.taskId },
    });

    return successResponse(null, 'Task deleted successfully');
  } catch (error) {
    console.error('Delete task error:', error);
    return errorResponse('An error occurred while deleting the task', 500);
  }
}
