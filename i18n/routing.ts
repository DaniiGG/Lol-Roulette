import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh-CN', 'ko', 'ar', 'ru', 'nl', 'pl'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});