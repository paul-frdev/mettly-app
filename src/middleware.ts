import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const isAuth = !!token;
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth') && !req.nextUrl.pathname.startsWith('/auth/reset-password');
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');
  const isLandingPage = req.nextUrl.pathname === '/';

  // Allow access to reset password page
  if (req.nextUrl.pathname === '/reset-password') {
    return NextResponse.next();
  }

  // Redirect authenticated users from landing to dashboard
  if (isLandingPage && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Redirect authenticated users from auth pages to dashboard
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Redirect unauthenticated users to login
  if (!isAuth && !isAuthPage && !isApiRoute && !isLandingPage) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/clients/:path*', '/calendar/:path*', '/settings/:path*', '/profile/:path*', '/appointments/:path*', '/auth/:path*'],
};
