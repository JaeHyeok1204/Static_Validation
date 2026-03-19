import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Normalize pathname: remove trailing slash and convert to lowercase for comparison
  const normalizedPathpos = pathname.endsWith('/') && pathname !== '/' 
    ? pathname.slice(0, -1) 
    : pathname;
  const path = normalizedPathpos.toLowerCase();

  // Define protected routes
  const protectedRoutes = [
    '/',
    '/subsystems',
    '/rules',
    '/issues',
    '/risks',
    '/time_evaluation',
    '/reports',
    '/ai_chat',
    '/data_editor',
    '/setting'
  ];

  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/find-id'];

  const cookieValue = request.cookies.get('auth_session')?.value;
  const isAuthenticated = cookieValue === 'true';

  // DEBUG LOG (Server-side console)
  console.log(`[Middleware] Path: ${path}, Authenticated: ${isAuthenticated}`);

  // 1. Redirect unauthenticated users from protected routes
  if (protectedRoutes.includes(path) && !isAuthenticated) {
    console.log(`[Middleware] Redirection to /login from ${path}`);
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 2. Redirect authenticated users from public routes to dashboard
  if (publicRoutes.includes(path) && isAuthenticated) {
    console.log(`[Middleware] Redirection to / from ${path}`);
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
