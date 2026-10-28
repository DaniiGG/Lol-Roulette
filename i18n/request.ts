import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

async function loadMessages(locale: string) {
  const common = (await import(`../locales/${locale}/common.json`)).default;
  const extraFiles = ['challenges', 'tierlist', 'modes', 'popular', 'champion-guides', 'champion-guide-content', 'guide-ui', 'blog', 'blog-content', 'patch-tier-list', 'quiz', 'page-seo'];
  const extra: Record<string, unknown> = {};
  for (const file of extraFiles) {
    try {
      extra[file] = (await import(`../locales/${locale}/${file}.json`)).default;
    } catch {
      try {
        extra[file] = (await import(`../locales/en/${file}.json`)).default;
      } catch {}
    }
  }

  // The mastery-tree file is already namespaced, so it is merged at the root.
  let masteryTree: Record<string, unknown> = {};
  try {
    masteryTree = (await import(`../locales/${locale}/mastery-tree.json`)).default;
  } catch {
    try {
      masteryTree = (await import('../locales/en/mastery-tree.json')).default;
    } catch {}
  }

  return { ...common, ...extra, ...masteryTree };
}

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.some((supported) => supported === locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: await loadMessages(locale)
  };
});