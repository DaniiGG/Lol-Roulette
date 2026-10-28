import {defineRouting} from 'next-intl/routing';
import {DEFAULT_LOCALE, LOCALES, pathnames} from './routes';

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
  pathnames,
});
