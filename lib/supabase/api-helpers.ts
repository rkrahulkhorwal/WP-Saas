import { NextResponse } from 'next/server'
import { createClient } from './server'

// Standard API response helpers
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function validationErrorResponse(message: string) {
  return errorResponse(message, 400)
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return errorResponse(message, 401)
}

export function forbiddenResponse(message: string = 'Forbidden') {
  return errorResponse(message, 403)
}

export function notFoundResponse(message: string = 'Not found') {
  return errorResponse(message, 404)
}

// Middleware to require authentication
export async function requireAuth(requiredRole?: string | string[]) {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, error: unauthorizedResponse('Authentication required') }
  }

  // Get full user profile from our users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { user: null, error: unauthorizedResponse('User profile not found') }
  }

  // Check role if required
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!roles.includes(profile.role)) {
      return { user: null, error: forbiddenResponse('Insufficient permissions') }
    }
  }

  return { user: profile, error: null }
}

// Helper to check event ownership or collaboration
export async function checkEventAccess(eventId: string, userId: string) {
  const supabase = createClient()

  // Check if user owns the event
  const { data: event } = await supabase
    .from('events')
    .select('user_id')
    .eq('id', eventId)
    .single()

  if (event && event.user_id === userId) {
    return true
  }

  // Check if user is a collaborator with accepted invitation
  const { data: collaborator } = await supabase
    .from('event_collaborators')
    .select('id, accepted_at')
    .eq('event_id', eventId)
    .not('accepted_at', 'is', null)
    .maybeSingle()

  if (collaborator) {
    // Get user email and match with collaborator
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (user) {
      const { data: matchedCollaborator } = await supabase
        .from('event_collaborators')
        .select('id')
        .eq('event_id', eventId)
        .eq('email', user.email)
        .not('accepted_at', 'is', null)
        .maybeSingle()

      return !!matchedCollaborator
    }
  }

  return false
}

// Helper to validate Zod schemas
export function validateRequest<T>(schema: any, data: unknown): { data: T | null; error: NextResponse | null } {
  try {
    const validated = schema.parse(data)
    return { data: validated, error: null }
  } catch (error: any) {
    const message = error.errors?.[0]?.message || 'Invalid request data'
    return { data: null, error: validationErrorResponse(message) }
  }
}
