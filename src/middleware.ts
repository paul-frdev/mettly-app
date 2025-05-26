import { withAuth } from 'next-auth/middleware';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';

// Создаем middleware для интернационализации
const intlMiddleware = createIntlMiddleware(routing);

// Комбинируем middleware для аутентификации и интернационализации
export default withAuth(
  function middleware(req) {
    // Если это корневой путь, редиректим на /en
    if (req.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/en', req.url));
    }
    return intlMiddleware(req);
  },
  {
    pages: {
      signIn: '/en/auth/login',
    },
    callbacks: {
      authorized: ({ req, token }) => {
        // Разрешаем доступ к публичным маршрутам
        const publicPaths = ['/', '/en', '/uk', '/en/auth', '/uk/auth', '/en/features', '/en/pricing', '/en/testimonials', '/uk/features', '/uk/pricing', '/uk/testimonials'];

        const isPublicPath = publicPaths.some((path) => req.nextUrl.pathname.startsWith(path));

        if (isPublicPath) {
          return true;
        }

        // Для защищенных маршрутов требуем токен
        return !!token;
      },
    },
  }
);

// Объединяем matcher для обоих middleware
export const config = {
  matcher: [
    // Корневой путь
    '/',
    // Публичные маршруты
    '/en',
    '/uk',
    '/en/auth/:path*',
    '/uk/auth/:path*',
    '/en/features/:path*',
    '/en/pricing/:path*',
    '/en/testimonials/:path*',
    '/uk/features/:path*',
    '/uk/pricing/:path*',
    '/uk/testimonials/:path*',
    // Защищенные маршруты
    '/en/dashboard/:path*',
    '/en/clients/:path*',
    '/en/appointments/:path*',
    '/en/settings/:path*',
    '/uk/dashboard/:path*',
    '/uk/clients/:path*',
    '/uk/appointments/:path*',
    '/uk/settings/:path*',
    // Маршруты для интернационализации (кроме системных)
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
  ],
};
