// app/privacy/page.tsx
import type { Metadata } from "next"
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import SlotLever from '@/components/SlotLever'
import { getHreflangAlternates } from '@/lib/seo-utils'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Privacy Policy - League Roulette',
    description: 'League Roulette privacy policy. Learn how we collect, use, and protect your data when you use our free LoL random champion generator and challenge tracker.',
    keywords: ['league roulette privacy policy', 'lol random champion privacy', 'league of legends data privacy', 'riot api privacy', 'privacy policy'],
    alternates: {
      canonical: locale === 'en' ? '/privacy' : `/${locale}/privacy`,
      languages: getHreflangAlternates('/privacy'),
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

const baseUrl = 'https://leagueroulette.com'

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: `${baseUrl}/privacy` },
  ],
}

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-neutral-400">Last updated: February 12, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-neutral max-w-none">
          <div className="space-y-8 text-neutral-300">
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p>
                Welcome to League Roulette ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-white mb-3">2.1 Riot Account Information</h3>
              <p>When you log in with your Riot Games account, we collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your Riot ID (Game Name and Tag Line)</li>
                <li>Your PUUID (Player Universally Unique Identifier)</li>
                <li>Your Summoner Name and Level</li>
                <li>Your selected region</li>
                <li>Your profile icon ID</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.2 Game Data</h3>
              <p>We access and store:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your recent match history</li>
                <li>Match results (win/loss, KDA, CS, gold earned)</li>
                <li>Champions played</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.3 Usage Data</h3>
              <p>We automatically collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Challenge completions and progress</li>
                <li>XP and level progression</li>
                <li>Achievement unlocks</li>
                <li>Session information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <p>We use the collected information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Authenticate your identity and maintain your session</li>
                <li>Track your challenge progress and statistics</li>
                <li>Verify match results and award XP</li>
                <li>Display leaderboards and achievements</li>
                <li>Improve our services and user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Data Storage and Security</h2>
              <p>
                Your data is stored securely using Supabase, a PostgreSQL-based platform with enterprise-grade security. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p className="mt-4">
                <strong>Important:</strong> We never store your Riot Games password. Authentication is handled entirely through Riot's official API.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing</h2>
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties. We only share data with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Riot Games:</strong> To verify your account and retrieve match data via their official API</li>
                <li><strong>Supabase:</strong> Our database provider for secure data storage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Cookies and Tracking</h2>
              <p>We use cookies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maintain your login session</li>
                <li>Remember your preferences</li>
                <li>Analyze usage patterns (via anonymous analytics)</li>
              </ul>
              <p className="mt-4">
                You can control cookie preferences through your browser settings, but disabling cookies may limit functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Export:</strong> Request a portable copy of your data</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at the email provided below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Data Retention</h2>
              <p>
                We retain your personal information for as long as your account is active or as needed to provide you services. You may request account deletion at any time, after which your data will be permanently removed within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Children's Privacy</h2>
              <p>
                Our service is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Third-Party Services</h2>
              <p>Our application uses:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Riot Games API:</strong> For authentication and match data</li>
                <li><strong>Supabase:</strong> For database and authentication services</li>
                <li><strong>Vercel:</strong> For hosting (if applicable)</li>
              </ul>
              <p className="mt-4">
                These services have their own privacy policies, which we encourage you to review.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="mt-4 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
                <p><strong>Email:</strong> lolroulettenine@gmail.com</p>
                <p className="mt-2"><strong>Website:</strong> <Link href="/contact" className="text-blue-400 hover:text-blue-300">Contact Form</Link></p>
              </div>
            </section>

            <section className="mt-12 pt-8 border-t border-neutral-700">
              <p className="text-sm text-neutral-500">
                League Roulette is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
              </p>
               <div>
      <SlotLever
      />
    </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  )
}