import { NextResponse, type NextRequest } from 'next/server'

/**
 * Edge-compatible middleware for Supabase session management
 * Uses fetch API instead of Node-specific Supabase client
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Get the access token from cookies
  const accessToken = request.cookies.get('sb-access-token')?.value
  const refreshToken = request.cookies.get('sb-refresh-token')?.value

  // If we have tokens, validate and potentially refresh the session
  if (accessToken || refreshToken) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

      // Use the access token if available, otherwise try to refresh
      const tokenToUse = accessToken || refreshToken

      // Validate the session using Supabase's REST API (Edge-compatible)
      const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`,
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
      })

      // If the token is invalid or expired, try to refresh using refresh token
      if (!userResponse.ok && refreshToken && refreshToken !== accessToken) {
        const refreshResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        })

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()

          // Set the new tokens in cookies
          if (refreshData.access_token) {
            response.cookies.set('sb-access-token', refreshData.access_token, {
              path: '/',
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 // 1 hour
            })
          }

          if (refreshData.refresh_token) {
            response.cookies.set('sb-refresh-token', refreshData.refresh_token, {
              path: '/',
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7 // 1 week
            })
          }
        }
      }
    } catch (error) {
      // If there's an error validating the session, clear the cookies
      console.error('Session validation error:', error)
      response.cookies.delete('sb-access-token')
      response.cookies.delete('sb-refresh-token')
    }
  }

  return response
}
