import type { Metadata } from 'next'
import '../globals.css'
import RootHead from '@/components/RootHead'
import { rootMetadata } from '@/lib/seo/root-metadata'

const geistSans = { variable: '' } as any
const geistMono = { variable: '' } as any

export const metadata: Metadata = rootMetadata

export default function NonLocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <RootHead />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WG86XDJF" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} /></noscript>
        {children}
      </body>
    </html>
  )
}
