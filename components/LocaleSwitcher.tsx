"use client"

import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useTransition } from 'react';
import { useState, useRef, useEffect } from 'react';
import { isPathname, isRouteAvailable, type AppPathnames } from '@/i18n/routes';
import { getAvailableLocales, getLocalizedSlug, resolvePostSlug } from '@/lib/blog/meta';
import { getGuideSlug, isGuideLocale, resolveGuideSlug } from '@/lib/guides/meta';

type LocaleParams = Readonly<Record<string, string | string[] | undefined>>;

type LocaleHref = {
  pathname: AppPathnames;
  params?: Record<string, string>;
};

function getLocaleHref(
  pathname: string,
  params: LocaleParams,
  locale: string,
  targetLocale: string
): LocaleHref | null {
  if (!isPathname(pathname)) return null;

  if (pathname === '/blog/[slug]') {
    const slug = typeof params.slug === 'string' ? params.slug : '';
    const canonical = resolvePostSlug(slug, locale);
    if (!canonical) return null;
    if (!getAvailableLocales(canonical).includes(targetLocale)) return null;
    return {
      pathname,
      params: { slug: getLocalizedSlug(canonical, targetLocale) },
    };
  }

  if (pathname === '/blog/guides/[champion]') {
    const champion = typeof params.champion === 'string' ? params.champion : '';
    const canonical = resolveGuideSlug(champion);
    if (!canonical || !isGuideLocale(targetLocale)) return null;
    return {
      pathname,
      params: { champion: getGuideSlug(canonical, targetLocale) },
    };
  }

  if (!isRouteAvailable(pathname, targetLocale)) return null;
  return { pathname };
}

const languages = [
  { code: 'en', label: 'English', flag: 'gb' },
  { code: 'es', label: 'Español', flag: 'es' },
  { code: 'fr', label: 'Français', flag: 'fr' },
  { code: 'de', label: 'Deutsch', flag: 'de' },
  { code: 'it', label: 'Italiano', flag: 'it' },
  { code: 'pt', label: 'Português', flag: 'br' },
  { code: 'ja', label: '日本語', flag: 'jp' },
  { code: 'zh-CN', label: '简体中文', flag: 'cn' },
  { code: 'ko', label: '한국어', flag: 'kr' },
  { code: 'ar', label: 'العربية', flag: 'sa' },
  { code: 'ru', label: 'Русский', flag: 'ru' },
  { code: 'nl', label: 'Nederlands', flag: 'nl' },
  { code: 'pl', label: 'Polski', flag: 'pl' },
];

function Flag({ code }: { code: string }) {
  const cls = "w-5 h-3.5 rounded-sm overflow-hidden shadow-sm shrink-0 block";
  switch (code) {
    case 'gb':
      return (
        <svg className={cls} viewBox="0 0 60 30">
          <rect width="60" height="30" fill="#012169"/>
          <path d="M0,0 60,30 M60,0 0,30" stroke="#fff" strokeWidth="6"/>
          <path d="M0,0 60,30 M60,0 0,30" stroke="#C8102E" strokeWidth="3"/>
          <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10"/>
          <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6"/>
        </svg>
      );
    case 'es':
      return (
        <svg className={cls} viewBox="0 0 60 30">
          <rect width="60" height="30" fill="#AA151B"/>
          <rect y="7.5" width="60" height="15" fill="#F1BF00"/>
        </svg>
      );
    case 'fr':
      return (
        <svg className={cls} viewBox="0 0 60 30">
          <rect width="20" height="30" fill="#0055A4"/>
          <rect x="20" width="20" height="30" fill="#fff"/>
          <rect x="40" width="20" height="30" fill="#EF4135"/>
        </svg>
      );
    case 'de':
      return (
        <svg className={cls} viewBox="0 0 60 30">
          <rect width="60" height="10" fill="#000"/>
          <rect y="10" width="60" height="10" fill="#DD0000"/>
          <rect y="20" width="60" height="10" fill="#FFCE00"/>
        </svg>
      );
    case 'it':
      return (
        <svg className={cls} viewBox="0 0 60 30">
          <rect width="20" height="30" fill="#009246"/>
          <rect x="20" width="20" height="30" fill="#fff"/>
          <rect x="40" width="20" height="30" fill="#CE2B37"/>
        </svg>
      );
    case 'br':
      return (
        <svg className={cls} viewBox="0 0 60 30">
          <rect width="60" height="30" fill="#009C3B"/>
          <polygon points="30,3 57,15 30,27 3,15" fill="#FFDF00"/>
          <circle cx="30" cy="15" r="7" fill="#002776"/>
        </svg>
      );
    case 'jp':
      return (
        <svg className={cls} viewBox="0 0 60 30">
          <rect width="60" height="30" fill="#fff"/>
          <circle cx="30" cy="15" r="9" fill="#BC002D"/>
        </svg>
      );
    case 'cn':
      return (
        <svg className={cls} viewBox="0 0 60 30">
          <rect width="60" height="30" fill="#EE1C25"/>
          <polygon points="8,5 9.5,8.5 13,8.5 10,11 11,14.5 8,12.5 5,14.5 6,11 3,8.5 6.5,8.5" fill="#FFDE00"/>
        </svg>
      );
    case 'kr':
      return (
        <svg className={cls} viewBox="0 0 60 30">
          <rect width="60" height="30" fill="#fff"/>
          <circle cx="30" cy="15" r="8" fill="#CD2E3A"/>
          <path d="M22,15 A8,8 0 0,0 38,15 A4,4 0 0,1 30,19 A4,4 0 0,0 22,15" fill="#0047A0"/>
        </svg>
      );
    case 'sa':
      return (
        <svg className={cls} viewBox="0 0 60 30">
          <rect width="60" height="30" fill="#006C35"/>
          <path d="M20,10 H40 M20,18 H40 M25,10 V18 M35,10 V18" stroke="#fff" strokeWidth="2"/>
        </svg>
      );
    case 'ru':
      return (
        <svg className={cls} viewBox="0 0 60 30">
          <rect width="60" height="10" fill="#fff"/>
          <rect y="10" width="60" height="10" fill="#0039A6"/>
          <rect y="20" width="60" height="10" fill="#D52B1E"/>
        </svg>
      );
    case 'nl':
      return (
        <svg className={cls} viewBox="0 0 60 30">
          <rect width="60" height="10" fill="#AE1C28"/>
          <rect y="10" width="60" height="10" fill="#fff"/>
          <rect y="20" width="60" height="10" fill="#21468B"/>
        </svg>
      );
    case 'pl':
      return (
        <svg className={cls} viewBox="0 0 60 30">
          <rect width="60" height="15" fill="#fff"/>
          <rect y="15" width="60" height="15" fill="#DC143C"/>
        </svg>
      );
    default:
      return <span className="w-5 h-3.5 inline-block bg-zinc-600 rounded-sm" />;
  }
}

export default function LocaleSwitcher() {
  const t = useTranslations('localeSwitcher');
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = languages.find(l => l.code === locale) || languages[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className="text-xs bg-zinc-800/80 border border-zinc-700 text-zinc-300 rounded-lg px-2 py-1.5 pr-4 cursor-pointer hover:border-zinc-500 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500/50 flex items-center gap-1.5"
        aria-label={t('label')}
      >
        <Flag code={current.flag} />
        <span>{current.label}</span>
        <svg className="w-3 h-3 text-zinc-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-50">
          {languages.map((lang) => {
            const target = getLocaleHref(String(pathname), params, locale, lang.code);
            const isCurrent = locale === lang.code;
            const disabled = !target || isCurrent;
            return (
              <button
                key={lang.code}
                disabled={disabled}
                onClick={() => {
                  if (!target || isCurrent) return;
                  startTransition(() => {
                    router.replace(target as never, { locale: lang.code });
                  });
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition ${
                  disabled ? 'cursor-not-allowed text-zinc-500' : 'hover:bg-zinc-700 text-zinc-300'
                } ${isCurrent ? 'bg-zinc-700 text-cyan-300' : ''}`}
                title={!target ? t('unavailable') : undefined}
              >
                <Flag code={lang.flag} />
                <span>{lang.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
