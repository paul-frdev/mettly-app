import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const isAuth = !!token;
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');
  const isLandingPage = req.nextUrl.pathname === '/';
  const isResetPasswordPage = req.nextUrl.pathname === '/reset-password';

  console.log('isResetPasswordPage', req.url, req.nextUrl.pathname, req.nextUrl.pathname === '/reset-password');

  // Allow access to reset password page
  if (isResetPasswordPage) {
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
  matcher: ['/', '/dashboard/:path*', '/clients/:path*', '/calendar/:path*', '/settings/:path*', '/profile/:path*', '/appointments/:path*', '/auth/:path*', '/auth/reset-password'],
};
