// app/terms/page.tsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
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

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-neutral-400">Last updated: February 12, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-neutral max-w-none">
          <div className="space-y-8 text-neutral-300">
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using League Roulette ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
              <p>
                League Roulette is a web application that provides:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Random champion selection for League of Legends players</li>
                <li>Challenge tracking and verification</li>
                <li>XP and achievement systems</li>
                <li>Leaderboards and statistics</li>
              </ul>
              <p className="mt-4">
                The Service integrates with Riot Games API to authenticate users and verify match results.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-semibold text-white mb-3">3.1 Account Creation</h3>
              <p>
                To use certain features, you must log in with your Riot Games account. By doing so, you represent that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You own the Riot Games account you're using</li>
                <li>You are at least 13 years of age</li>
                <li>All information you provide is accurate and current</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.2 Account Security</h3>
              <p>
                You are responsible for maintaining the security of your account. We use Riot's official authentication system and never store your password.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. User Conduct</h2>
              <p>You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Service for any illegal purpose</li>
                <li>Attempt to manipulate or abuse the challenge verification system</li>
                <li>Use bots, scripts, or automated tools to interact with the Service</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Violate Riot Games' Terms of Service or Community Guidelines</li>
                <li>Share or sell your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Riot Games Integration</h2>
              <p>
                League Roulette uses the Riot Games API to access your account information and match data. By using our Service, you acknowledge that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We are not affiliated with, endorsed by, or sponsored by Riot Games</li>
                <li>You must comply with Riot's Terms of Service</li>
                <li>Riot Games may revoke API access at any time</li>
                <li>We are subject to Riot's API rate limits and usage policies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
              <h3 className="text-xl font-semibold text-white mb-3">6.1 Our Content</h3>
              <p>
                The Service, including its code, design, and original features, is owned by League Roulette and protected by copyright and other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">6.2 Riot Games Content</h3>
              <p>
                League of Legends, Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc. All champion images, names, and game data are property of Riot Games.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Disclaimers and Limitations</h2>
              <h3 className="text-xl font-semibold text-white mb-3">7.1 "As Is" Service</h3>
              <p>
                The Service is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The Service will be uninterrupted or error-free</li>
                <li>Match verification will always be accurate</li>
                <li>Your data will never be lost (though we take precautions)</li>
                <li>The Service will always be available</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">7.2 Limitation of Liability</h3>
              <p>
                We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Beta Status</h2>
              <p>
                League Roulette is currently in beta. This means:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Features may change or be removed without notice</li>
                <li>Bugs and errors may occur</li>
                <li>Data may be reset during major updates (we'll notify you)</li>
                <li>The Service may be discontinued at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Data and Privacy</h2>
              <p>
                Your use of the Service is also governed by our <Link href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>. Please review it to understand how we collect and use your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your access to the Service at any time, with or without cause, with or without notice. You may also terminate your account at any time by contacting us.
              </p>
              <p className="mt-4">
                Upon termination, your right to use the Service will immediately cease, but provisions regarding intellectual property, disclaimers, and limitations of liability will survive.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Modifications to Terms</h2>
              <p>
                We may modify these Terms at any time. We will notify users of material changes by posting a notice on the Service or sending an email. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Contact Information</h2>
              <p>
                If you have questions about these Terms, please contact us:
              </p>
              <div className="mt-4 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
                <p><strong>Email:</strong> lolroulettenine@gmail.com</p>
                <p className="mt-2"><strong>Website:</strong> <Link href="/contact" className="text-blue-400 hover:text-blue-300">Contact Form</Link></p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">14. Severability</h2>
              <p>
                If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect.
              </p>
            </section>

            <section className="mt-12 pt-8 border-t border-neutral-700">
              <p className="text-sm text-neutral-500">
                League Roulette is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
              </p>
            </section>

          </div>
        </div>
      </div>
    </main>
  )
}