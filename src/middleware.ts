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
      signIn: '/auth/login',
    },
  }
);

// Объединяем matcher для обоих middleware
export const config = {
  matcher: [
    // Защищенные маршруты
    '/dashboard/:path*',
    '/clients/:path*',
    '/appointments/:path*',
    '/settings/:path*',
    // Маршруты для интернационализации (кроме системных)
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
  ],
};
