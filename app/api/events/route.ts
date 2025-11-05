import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, requireAuth, validateRequest } from '@/lib/supabase/api-helpers';
import { createEventSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth();

    if (authError) {
      return authError;
    }

    const supabase = createClient();

    // Get events for the user
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user!.id)
      .order('date', { ascending: true });

    if (error) {
      console.error('Get events error:', error);
      return errorResponse('An error occurred while fetching events', 500);
    }

    // Get counts for each event
    const eventsWithCounts = await Promise.all(
      (events || []).map(async (event: any) => {
        const [guestsCount, tasksCount, expensesCount] = await Promise.all([
          supabase.from('guests').select('id', { count: 'exact', head: true }).eq('event_id', event.id),
          supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('event_id', event.id),
          supabase.from('expenses').select('id', { count: 'exact', head: true }).eq('event_id', event.id),
        ]);

        return {
          ...event,
          _count: {
            guests: guestsCount.count || 0,
            tasks: tasksCount.count || 0,
            expenses: expensesCount.count || 0,
          },
        };
      })
    );

    return successResponse(eventsWithCounts);
  } catch (error) {
    console.error('Get events error:', error);
    return errorResponse('An error occurred while fetching events', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth();

    if (authError) {
      return authError;
    }

    const body = await request.json();
    const { data: validatedData, error: validationError } = validateRequest(createEventSchema, body);

    if (validationError) {
      return validationError;
    }

    // Type assertion for validated data
    const data = validatedData as any;

    const supabase = createClient();

    // Generate a unique website slug if not provided
    let websiteSlug = data!.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Ensure slug is unique
    let { data: slugExists } = await supabase
      .from('events')
      .select('id')
      .eq('website_slug', websiteSlug)
      .maybeSingle();

    let counter = 1;
    const baseSlug = websiteSlug;
    while (slugExists) {
      websiteSlug = `${baseSlug}-${counter}`;
      const result = await supabase
        .from('events')
        .select('id')
        .eq('website_slug', websiteSlug)
        .maybeSingle();
      slugExists = result.data;
      counter++;
    }

    const { data: event, error } = await (supabase
      .from('events') as any)
      .insert({
        user_id: user!.id,
        name: data!.name,
        type: data!.type || 'Wedding',
        date: data!.date,
        time: data!.time,
        venue: data!.venue,
        venue_address: data!.venueAddress,
        budget: data!.budget,
        guest_count: data!.guestCount,
        description: data!.description,
        partner1_name: data!.partner1Name,
        partner2_name: data!.partner2Name,
        website_slug: websiteSlug,
      })
      .select()
      .single();

    if (error) {
      console.error('Create event error:', error);
      return errorResponse('An error occurred while creating the event', 500);
    }

    return successResponse(
      {
        ...event,
        _count: {
          guests: 0,
          tasks: 0,
          expenses: 0,
        },
      },
      201
    );
  } catch (error) {
    console.error('Create event error:', error);
    return errorResponse('An error occurred while creating the event', 500);
  }
}
