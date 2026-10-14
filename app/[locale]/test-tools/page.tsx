import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import LocalTestConsole from './LocalTestConsole'

export default async function TestToolsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (process.env.NODE_ENV !== 'development') notFound()

  setRequestLocale(locale)
  return <LocalTestConsole />
}