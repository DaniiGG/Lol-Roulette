import type { Metadata } from 'next'
import '../globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import RootHead from '@/components/RootHead'
import { rootMetadata } from '@/lib/seo/root-metadata'
import { LOCALES } from '@/i18n/routes'

const geistSans = { variable: '' } as any
const geistMono = { variable: '' } as any

const rtlLocales = ['ar']
const serverOnlyMessages = new Set(['blog-content', 'champion-guide-content', 'patch-tier-list'])

export const metadata: Metadata = rootMetadata
export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.map(locale => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  setRequestLocale(locale)
  const messages = Object.fromEntries(
    Object.entries(await getMessages()).filter(([namespace]) => !serverOnlyMessages.has(namespace))
  )
  const dir = rtlLocales.includes(locale) ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir}>
      <head>
        <RootHead />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WG86XDJF" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} /></noscript>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <div className="pt-16">
            {children}
          </div>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
