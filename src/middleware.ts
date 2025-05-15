import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware() {
    // Return response to continue if user is authenticated
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth/login',
    },
  }
);

// Protect all routes under /dashboard, /clients, /calendar, /settings, /profile, /appointments
export const config = {
  matcher: ['/dashboard/:path*', '/clients/:path*', '/calendar/:path*', '/settings/:path*', '/profile/:path*', '/appointments/:path*'],
};
