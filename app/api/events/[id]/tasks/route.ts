import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware';
import { createTaskSchema } from '@/lib/validators';
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const where: any = { eventId: params.id };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const tasks = await prisma.task.findMany({
      where,
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
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });

    return successResponse(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    return errorResponse('An error occurred while fetching tasks', 500);
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
      return forbiddenResponse('You do not have permission to add tasks to this event');
    }

    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    const taskData: any = {
      eventId: params.id,
      title: validatedData.title,
      description: validatedData.description,
      priority: validatedData.priority,
      category: validatedData.category,
    };

    if (validatedData.dueDate) {
      taskData.dueDate = new Date(validatedData.dueDate);
    }

    if (validatedData.assignedToId) {
      taskData.assignedToId = validatedData.assignedToId;
    }

    const task = await prisma.task.create({
      data: taskData,
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

    return successResponse(task, 'Task created successfully', 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error.errors);
    }

    console.error('Create task error:', error);
    return errorResponse('An error occurred while creating the task', 500);
  }
}
