import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buildPageMetadata } from '@/lib/seo/page-metadata'

const MASTERY_TREE_LOCALES = ['en', 'es'] as const

type Props = {
  params: Promise<{ locale: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'masteryTreeExplorer' })

  const metadata = buildPageMetadata({
    locale,
    path: '/mastery-tree',
    title: t('seoTitle'),
    description: t('seoDescription'),
    alternateLocales: MASTERY_TREE_LOCALES,
  })

  return {
    ...metadata,
    title: { absolute: t('seoTitle') },
  }
}

export default function MasteryTreeLayout({ children }: Props) {
  return <>{children}</>
}
