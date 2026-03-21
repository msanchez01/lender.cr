import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Shield, TrendingUp, AlertTriangle, XCircle } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import LtvCalculator from '@/components/LtvCalculator'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Calculator' })
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lender.cr'

  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
    alternates: {
      languages: {
        'en': `${siteUrl}/en/calculator`,
        'es': `${siteUrl}/es/calculator`,
        'x-default': `${siteUrl}/en/calculator`,
      },
    },
  }
}

const TIER_INFO = [
  { key: 'tierExcellentDescription', icon: Shield, color: 'text-success-600', bg: 'bg-success-50' },
  { key: 'tierGoodDescription', icon: TrendingUp, color: 'text-primary-600', bg: 'bg-primary-50' },
  { key: 'tierStandardDescription', icon: AlertTriangle, color: 'text-gold-600', bg: 'bg-gold-50' },
  { key: 'tierNotQualifiedDescription', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
] as const

export default async function CalculatorPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Calculator')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lender.cr'

  return (
    <div className="max-w-4xl mx-auto">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Lender.cr LTV Calculator',
        description: t('pageDescription'),
        url: `${siteUrl}/${locale}/calculator`,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      }} />

      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {t('pageTitle')}
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          {t('pageDescription')}
        </p>
      </div>

      <LtvCalculator />

      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('whatIsLtv')}</h2>
        <p className="text-gray-500 mb-6">{t('whatIsLtvDescription')}</p>

        <div className="space-y-3">
          {TIER_INFO.map(({ key, icon: Icon, color, bg }) => (
            <div key={key} className={`flex items-start gap-3 p-4 rounded-lg ${bg}`}>
              <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${color}`} />
              <p className="text-sm text-gray-700">{t(key)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
