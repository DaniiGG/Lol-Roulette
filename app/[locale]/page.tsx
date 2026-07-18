import type { Metadata } from "next"
import { setRequestLocale } from 'next-intl/server'
import { getHreflangAlternates } from '@/lib/seo-utils'
import HomeClient from './HomeClient'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params

  return {
    alternates: {
      canonical: locale === 'en' ? '/' : `/${locale}`,
      languages: getHreflangAlternates('/'),
    },
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  return <HomeClient />
}
