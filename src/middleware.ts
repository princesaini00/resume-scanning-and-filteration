import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Configure which paths should be protected for regular users
const userProtectedPaths = [
  '/upload-resume',
  '/already-applied',
  '/jobs/[id]'
  // Add other protected routes here
];

// Configure which paths should be protected for admins only
const adminProtectedPaths = [
  '/admin-add-job',
  '/resume-filter',
  '/resume-results'
  // Add other admin routes here
];

// Paths that should always be accessible
const publicPaths = [
  '/login',
  '/signup',
  '/forget-password',
  '/signup-success',
  '/admin-login'
  // Add other public routes here
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is in admin protected paths
  const isAdminPath = adminProtectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Check if the path is in user protected paths
  const isUserProtectedPath = userProtectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // If the path is public, allow access
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // If no token and the path requires authentication
  if (!token && (isUserProtectedPath || isAdminPath)) {
    const redirectUrl = isAdminPath ? '/admin-login' : '/login';
    const url = new URL(redirectUrl, request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // If path is admin-only and user is not an admin
  if (isAdminPath && (!token || token.role !== 'admin')) {
    const url = new URL('/admin-login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // Continue if authorization checks pass
  return NextResponse.next();
}

// Configure the paths that the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (stored images)
     * - api/auth (auth API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|api/auth).*)',
  ],
};