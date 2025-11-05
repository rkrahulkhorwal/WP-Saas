import { NextRequest } from 'next/server';
import { verifyAccessToken, getTokenFromHeader, TokenPayload } from './auth';
import { unauthorizedResponse, forbiddenResponse } from './api-response';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

export async function authenticate(
  request: NextRequest
): Promise<{ success: true; user: TokenPayload } | { success: false; response: Response }> {
  const authHeader = request.headers.get('authorization');
  const token = getTokenFromHeader(authHeader);

  if (!token) {
    return {
      success: false,
      response: unauthorizedResponse('No token provided'),
    };
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    return {
      success: false,
      response: unauthorizedResponse('Invalid or expired token'),
    };
  }

  return { success: true, user: payload };
}

export async function requireAuth(
  request: NextRequest,
  allowedRoles?: string[]
): Promise<{ success: true; user: TokenPayload } | { success: false; response: Response }> {
  const authResult = await authenticate(request);

  if (!authResult.success) {
    return authResult;
  }

  if (allowedRoles && !allowedRoles.includes(authResult.user.role)) {
    return {
      success: false,
      response: forbiddenResponse('Insufficient permissions'),
    };
  }

  return authResult;
}
