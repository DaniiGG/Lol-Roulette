import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export const config = {
  matcher: ['/((?!api|_next|_vercel|auth|profile|test-verify|.*\\..*).*)']
};

export default createMiddleware(routing);