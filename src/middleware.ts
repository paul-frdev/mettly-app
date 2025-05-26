import { withAuth } from 'next-auth/middleware';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Создаем middleware для интернационализации
const intlMiddleware = createIntlMiddleware(routing);

// Комбинируем middleware для аутентификации и интернационализации
export default withAuth(
  function middleware(req) {
    return intlMiddleware(req);
  },
  {
    pages: {
      signIn: '/en/auth/login',
    },
    callbacks: {
      authorized: ({ req, token }) => {
        // Разрешаем доступ к публичным маршрутам
        if (req.nextUrl.pathname.startsWith('/en/auth') || req.nextUrl.pathname === '/en' || req.nextUrl.pathname === '/uk' || req.nextUrl.pathname.startsWith('/uk/auth')) {
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
