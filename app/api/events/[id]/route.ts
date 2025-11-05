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
      ...event,
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

    const updateData: any = {};

    if (validatedData!.name !== undefined) updateData.name = validatedData!.name;
    if (validatedData!.type !== undefined) updateData.type = validatedData!.type;
    if (validatedData!.date !== undefined) updateData.date = validatedData!.date;
    if (validatedData!.time !== undefined) updateData.time = validatedData!.time;
    if (validatedData!.venue !== undefined) updateData.venue = validatedData!.venue;
    if (validatedData!.venueAddress !== undefined) updateData.venue_address = validatedData!.venueAddress;
    if (validatedData!.budget !== undefined) updateData.budget = validatedData!.budget;
    if (validatedData!.guestCount !== undefined) updateData.guest_count = validatedData!.guestCount;
    if (validatedData!.description !== undefined) updateData.description = validatedData!.description;
    if (validatedData!.partner1Name !== undefined) updateData.partner1_name = validatedData!.partner1Name;
    if (validatedData!.partner2Name !== undefined) updateData.partner2_name = validatedData!.partner2Name;

    const { data: updatedEvent, error } = await supabase
      .from('events')
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
