import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { MapPin, DollarSign, BarChart3, ArrowRight } from 'lucide-react'
import { routing } from '@/i18n/routing'
import { Link } from '@/i18n/navigation'
import JsonLd from '@/components/JsonLd'
import LtvCalculator from '@/components/LtvCalculator'
import { LOCATIONS, LOCATION_SLUGS } from '@/lib/data/locations'
import { formatCurrency, MAX_LTV } from '@/lib/utils/ltv'

type Props = { params: Promise<{ locale: string; location: string }> }

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    LOCATION_SLUGS.map((location) => ({ locale, location }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, location: slug } = await params
  const loc = LOCATIONS[slug]
  if (!loc) return {}

  const t = await getTranslations({ locale, namespace: 'LendingLocations' })
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lender.cr'
  const name = locale === 'es' ? loc.nameEs : loc.name

  return {
    title: t('heroTitle', { location: name }),
    description: t('heroDescription', { location: name }),
    alternates: {
      canonical: `${siteUrl}/${locale}/hard-money-loans/${slug}`,
      languages: {
        'en': `${siteUrl}/en/hard-money-loans/${slug}`,
        'es': `${siteUrl}/es/hard-money-loans/${slug}`,
        'x-default': `${siteUrl}/en/hard-money-loans/${slug}`,
      },
    },
  }
}

const LOCATION_DESCRIPTION_KEYS: Record<string, string> = {
  escazu: 'escazuDescription',
  'santa-ana': 'santaAnaDescription',
  guanacaste: 'guanacasteDescription',
  tamarindo: 'tamarindoDescription',
  jaco: 'jacoDescription',
}

export default async function LocationLendingPage({ params }: Props) {
  const { locale, location: slug } = await params
  const loc = LOCATIONS[slug]
  if (!loc) notFound()

  setRequestLocale(locale)
  const t = await getTranslations('LendingLocations')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lender.cr'
  const name = locale === 'es' ? loc.nameEs : loc.name

  return (
    <div className="max-w-4xl mx-auto">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FinancialService',
        name: `Lender.cr — ${name}`,
        url: `${siteUrl}/${locale}/hard-money-loans/${slug}`,
        description: t('heroDescription', { location: name }),
        areaServed: {
          '@type': 'Place',
          name: `${name}, Costa Rica`,
          address: {
            '@type': 'PostalAddress',
            addressLocality: name,
            addressCountry: 'CR',
          },
        },
        serviceType: ['Private Lending', 'Hard Money Loans', 'Real Estate Financing'],
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t('breadcrumbHome'), item: `${siteUrl}/${locale}` },
          { '@type': 'ListItem', position: 2, name: t('breadcrumbLending'), item: `${siteUrl}/${locale}/hard-money-loans/${slug}` },
          { '@type': 'ListItem', position: 3, name: name },
        ],
      }} />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary-600">{t('breadcrumbHome')}</Link>
        <span>/</span>
        <span className="text-gray-700">{t('heroTitle', { location: name })}</span>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-2xl text-white p-8 md:p-12 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/20" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-5 w-5 text-gold-400" />
            <span className="text-primary-200 text-sm">{name}, Costa Rica</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {t('heroTitle', { location: name })}
          </h1>
          <p className="text-primary-100 max-w-xl">
            {t('heroDescription', { location: name })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <DollarSign className="h-5 w-5 text-primary-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500">{t('avgPropertyValue')}</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(loc.avgPropertyValue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <BarChart3 className="h-5 w-5 text-primary-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500">{t('commonLoanRange')}</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(loc.commonLoanRange[0])} – {formatCurrency(loc.commonLoanRange[1])}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <MapPin className="h-5 w-5 text-primary-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500">{t('maxLtv')}</p>
          <p className="text-lg font-semibold text-gray-900">{MAX_LTV}%</p>
        </div>
      </div>

      {/* Market Context */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">{t('marketContext')}</h2>
        <p className="text-gray-600 leading-relaxed">
          {t(LOCATION_DESCRIPTION_KEYS[slug])}
        </p>
      </div>

      {/* Calculator */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('calculatorTitle')}</h2>
        <p className="text-gray-500 text-sm mb-4">{t('calculatorDescription', { location: name })}</p>
        <LtvCalculator compact />
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/auth/register"
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-4 rounded-xl transition-colors"
        >
          {t('borrowerCta', { location: name })}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/auth/register?role=investor"
          className="flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold px-6 py-4 rounded-xl transition-colors"
        >
          {t('investorCta')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
