import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse, requireAuth, validateRequest, checkEventAccess } from '@/lib/supabase/api-helpers';
import { updateEventSchema } from '@/lib/validators';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await requireAuth();

    if (authError) {
      return authError;
    }

    const supabase = createClient();

    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        planner:planner_profiles (
          *,
          user:users (
            id,
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('id', params.id)
      .single();

    if (error || !event) {
      return notFoundResponse('Event not found');
    }

    // Type assertion for the event
    const typedEvent = event as any;

    // Check if user has access to this event
    const hasAccess = await checkEventAccess(params.id, user!.id);
    if (!hasAccess) {
      return forbiddenResponse('You do not have access to this event');
    }

    // Get counts
    const [guestsCount, tasksCount, expensesCount, bookingsCount] = await Promise.all([
      supabase.from('guests').select('id', { count: 'exact', head: true }).eq('event_id', params.id),
      supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('event_id', params.id),
      supabase.from('expenses').select('id', { count: 'exact', head: true }).eq('event_id', params.id),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('event_id', params.id),
    ]);

    return successResponse({
      ...typedEvent,
      _count: {
        guests: guestsCount.count || 0,
        tasks: tasksCount.count || 0,
        expenses: expensesCount.count || 0,
        bookings: bookingsCount.count || 0,
      },
    });
  } catch (error) {
    console.error('Get event error:', error);
    return errorResponse('An error occurred while fetching the event', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await requireAuth();

    if (authError) {
      return authError;
    }

    const supabase = createClient();

    // Check if user has access
    const hasAccess = await checkEventAccess(params.id, user!.id);
    if (!hasAccess) {
      return forbiddenResponse('You do not have permission to update this event');
    }

    const body = await request.json();
    const { data: validatedData, error: validationError } = validateRequest(updateEventSchema, body);

    if (validationError) {
      return validationError;
    }

    // Type assertion for validated data
    const data = validatedData as any;
    const updateData: any = {};

    if (data!.name !== undefined) updateData.name = data!.name;
    if (data!.type !== undefined) updateData.type = data!.type;
    if (data!.date !== undefined) updateData.date = data!.date;
    if (data!.time !== undefined) updateData.time = data!.time;
    if (data!.venue !== undefined) updateData.venue = data!.venue;
    if (data!.venueAddress !== undefined) updateData.venue_address = data!.venueAddress;
    if (data!.budget !== undefined) updateData.budget = data!.budget;
    if (data!.guestCount !== undefined) updateData.guest_count = data!.guestCount;
    if (data!.description !== undefined) updateData.description = data!.description;
    if (data!.partner1Name !== undefined) updateData.partner1_name = data!.partner1Name;
    if (data!.partner2Name !== undefined) updateData.partner2_name = data!.partner2Name;

    const { data: updatedEvent, error } = await (supabase
      .from('events') as any)
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Update event error:', error);
      return errorResponse('An error occurred while updating the event', 500);
    }

    return successResponse(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    return errorResponse('An error occurred while updating the event', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await requireAuth();

    if (authError) {
      return authError;
    }

    const supabase = createClient();

    // Check if user has access
    const hasAccess = await checkEventAccess(params.id, user!.id);
    if (!hasAccess) {
      return forbiddenResponse('You do not have permission to delete this event');
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Delete event error:', error);
      return errorResponse('An error occurred while deleting the event', 500);
    }

    return successResponse({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    return errorResponse('An error occurred while deleting the event', 500);
  }
}
