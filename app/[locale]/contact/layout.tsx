import type { Metadata } from "next"
import { getHreflangAlternates } from '@/lib/seo-utils'

type Props = {
  params: Promise<{ locale: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Contact Us - League Roulette | Support & Feedback',
    description: 'Contact the League Roulette team. Get support, send feedback, or report issues about the free LoL random champion generator and challenge tracker.',
    keywords: ['contact league roulette', 'league roulette support', 'lol random champion feedback', 'league roulette help', 'contact us'],
    alternates: {
      canonical: locale === 'en' ? '/contact' : `/${locale}/contact`,
      languages: getHreflangAlternates('/contact'),
    },
    openGraph: {
      title: 'Contact League Roulette | Support',
      description: 'Get in touch with the League Roulette team for support, feedback, or inquiries.',
      url: locale === 'en' ? '/contact' : `/${locale}/contact`,
      siteName: 'League Roulette',
    },
  }
}

export default function ContactLayout({ children }: Props) {
  return <>{children}</>
}
