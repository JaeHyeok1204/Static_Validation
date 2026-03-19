import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];

  const currentUser = request.cookies.get('auth_session')?.value;

  if (protectedRoutes.some(route => pathname === route) && !currentUser) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (publicRoutes.some(route => pathname === route) && currentUser) {
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
