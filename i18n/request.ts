import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

async function loadMessages(locale: string) {
  const common = (await import(`../locales/${locale}/common.json`)).default;
  const extraFiles = ['challenges', 'tierlist', 'modes', 'popular', 'champion-guides', 'blog'];
  const extra: Record<string, any> = {};
  for (const file of extraFiles) {
    try {
      extra[file] = (await import(`../locales/${locale}/${file}.json`)).default;
    } catch {
      try {
        extra[file] = (await import(`../locales/en/${file}.json`)).default;
      } catch {}
    }
  }
  return { ...common, ...extra };
}

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: await loadMessages(locale)
  };
});