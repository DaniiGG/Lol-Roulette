// app/contact/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Mail, MessageSquare, Send, CheckCircle, ArrowLeft, Lightbulb } from 'lucide-react'
import { useTranslations } from 'next-intl'

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://lol-roulette-nine.vercel.app' },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://lol-roulette-nine.vercel.app/contact' },
  ],
}

export default function ContactPage() {
  const t = useTranslations('contact')
  useEffect(() => {
    document.title = 'Contact Us - League Roulette | Support & Feedback'
  }, [])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="max-w-4xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className="mb-12">
          <a href="/" className="text-neutral-400 hover:text-white transition text-sm mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('backToHome')}
          </a>
          <h1 className="text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl text-neutral-400">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <div>
            {submitted ? (
              <div className="p-8 bg-green-500/10 border border-green-500 rounded-2xl">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t('successTitle')}</h3>
                  <p className="text-green-300 mb-6">
                    {t('successDesc')}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-3 bg-white text-neutral-950 rounded-xl font-semibold hover:bg-neutral-100 transition"
                  >
                    {t('sendAnother')}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('formName')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:border-white focus:outline-none transition"
                    placeholder={t('namePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">{t('formEmail')}</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:border-white focus:outline-none transition"
                    placeholder={t('emailPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">{t('formSubject')}</label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:border-white focus:outline-none transition"
                  >
                    <option value="">{t('subjectSelect')}</option>
                    <option value="general">{t('subjectGeneral')}</option>
                    <option value="bug">{t('subjectBug')}</option>
                    <option value="feature">{t('subjectFeature')}</option>
                    <option value="partnership">{t('subjectPartnership')}</option>
                    <option value="support">{t('subjectSupport')}</option>
                    <option value="other">{t('subjectOther')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">{t('formMessage')}</label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:border-white focus:outline-none transition resize-none"
                    placeholder={t('messagePlaceholder')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-white text-neutral-950 rounded-xl font-semibold hover:bg-neutral-100 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-neutral-950/20 border-t-neutral-950 rounded-full animate-spin" />
                      {t('sending')}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t('send')}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            
            {/* Email */}
            <div className="p-6 bg-neutral-800/50 rounded-2xl border border-neutral-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{t('emailLabel')}</h3>
                  <a href="mailto:contact@leagueroulette.com" className="text-blue-400 hover:text-blue-300 transition">
                    lolroulettenine@gmail.com
                  </a>
                  <p className="text-sm text-neutral-400 mt-2">
                    {t('emailDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Discord */}
            <div className="p-6 bg-neutral-800/50 rounded-2xl border border-neutral-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{t('discordLabel')}</h3>
                  <a 
                    href="" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 transition"
                  >
                    {t('discordDesc')}
                  </a>
                  <p className="text-sm text-neutral-400 mt-2">
                    {t('discordText')}
                  </p>
                </div>
              </div>
            </div>

            {/* Twitter */}
            <div className="p-6 bg-neutral-800/50 rounded-2xl border border-neutral-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{t('twitterLabel')}</h3>
                  <a 
                    href="" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition"
                  >
                    @--
                  </a>
                  <p className="text-sm text-neutral-400 mt-2">
                    {t('twitterDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-2">{t('quickHelp')}</h3>
                  <p className="text-sm text-neutral-300 mb-3">
                    {t('quickHelpDesc')}
                  </p>
                  <button
                    onClick={() => window.location.href = '/?showInfo=true'}
                    className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold transition"
                  >
                    {t('viewFaq')}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}