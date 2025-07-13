// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  exp: number;
}

export function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get('auth_token')?.value;
  
  // Define protected paths and their required roles
  const protectedPaths = ['/dashboard', '/task', '/task-report', '/assignee', '/add-ons', '/add-users'];
  const roleRequirements: Record<string, string[]> = {
    '/add-ons': ['admin', 'superadmin'],
    '/add-users': ['superadmin']
  };
  
  // Default role requirement for protected paths
  const defaultRoleRequirement: string[] = [];
  
  // Check if the current path is protected
  const path = request.nextUrl.pathname;
  const isProtectedPath = protectedPaths.some(pp => path.startsWith(pp));
  
  // If it's a protected path and there's no token, redirect to login
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If token exists but path requires specific roles
  if (token && isProtectedPath) {
    try {
      // Decode the token
      const payload = jwtDecode<JWTPayload>(token);
      const userRole = payload.role;
      
      // Check token expiration
      if (payload.exp * 1000 < Date.now()) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      // Find the role requirements for this path
      const requiredRoles = Object.keys(roleRequirements).find(
        key => path.startsWith(key)
      ) ? roleRequirements[Object.keys(roleRequirements).find(
        key => path.startsWith(key)
      ) as string] : defaultRoleRequirement;
      
      // If role requirements exist and user doesn't have required role
      if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      // If token is invalid, redirect to login
      console.error('Invalid token:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Continue with the request
  return NextResponse.next();
}

// Specify which paths this middleware will run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/task/:path*',
    '/task-report/:path*',
    '/add-users/:path*',
    '/assignee/:path*',
    '/add-ons/:path*',
    '/api/:path*', // Also protect API routes
  ],
};