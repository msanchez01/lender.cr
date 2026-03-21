import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Eye, Zap, Scale, ShieldCheck, ArrowRight } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import { Link } from '@/i18n/navigation'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'AboutPage' })
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lender.cr'

  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
    alternates: {
      languages: {
        'en': `${siteUrl}/en/about`,
        'es': `${siteUrl}/es/about`,
        'x-default': `${siteUrl}/en/about`,
      },
    },
  }
}

const VALUE_ICONS = [Eye, Zap, Scale, ShieldCheck]

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('AboutPage')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lender.cr'

  return (
    <div className="max-w-4xl mx-auto">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Lender.cr',
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        description: t('pageDescription'),
        foundingDate: '2026',
        areaServed: { '@type': 'Country', name: 'Costa Rica' },
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'CR',
          addressRegion: 'San José',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'info@lender.cr',
          contactType: 'customer service',
          availableLanguage: ['English', 'Spanish'],
        },
      }} />

      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {t('pageTitle')}
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          {t('pageDescription')}
        </p>
      </div>

      <div className="space-y-10 mb-12">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">{t('storyTitle')}</h2>
          <p className="text-gray-600 leading-relaxed">{t('storyText')}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">{t('missionTitle')}</h2>
          <p className="text-gray-600 leading-relaxed">{t('missionText')}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">{t('ecosystemTitle')}</h2>
          <p className="text-gray-600 leading-relaxed">{t('ecosystemText')}</p>
        </section>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">{t('valuesTitle')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {Array.from({ length: 4 }, (_, i) => {
            const Icon = VALUE_ICONS[i]
            return (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{t(`value${i + 1}Title`)}</h3>
                </div>
                <p className="text-sm text-gray-500">{t(`value${i + 1}Description`)}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl text-white p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">{t('ctaTitle')}</h2>
        <p className="text-primary-100 mb-6">{t('ctaDescription')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            {t('ctaBorrower')}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg border border-white/20 transition-colors"
          >
            {t('ctaInvestor')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
