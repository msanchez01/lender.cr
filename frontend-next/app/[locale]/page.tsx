import { ArrowRight, Shield, Clock, Eye, Globe } from 'lucide-react'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import JsonLd from '@/components/JsonLd'
import { Link } from '@/i18n/navigation'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('HomePage')
  const tMeta = await getTranslations('Metadata')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lender.cr'

  return (
    <div>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Lender.cr',
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        description: tMeta('description'),
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'info@lender.cr',
          contactType: 'customer service',
        },
        sameAs: [],
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Lender.cr',
        url: siteUrl,
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FinancialService',
        name: 'Lender.cr',
        url: siteUrl,
        description: tMeta('description'),
        areaServed: {
          '@type': 'Country',
          name: 'Costa Rica',
        },
        serviceType: ['Private Lending', 'Hard Money Loans', 'Real Estate Financing'],
      }} />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-2xl text-white p-8 md:p-12 lg:p-16 mb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/20" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/10" />
        </div>

        <div className="relative max-w-3xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="text-base md:text-lg text-primary-100 mb-8 max-w-xl">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              {t('borrowerCta')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg border border-white/20 transition-colors"
            >
              {t('investorCta')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          {t('howItWorksTitle')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', title: t('step1Title'), description: t('step1Description') },
            { step: '2', title: t('step2Title'), description: t('step2Description') },
            { step: '3', title: t('step3Title'), description: t('step3Description') },
          ].map(({ step, title, description }) => (
            <div key={step} className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg mb-4">
                {step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Lender.cr */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          {t('whyTitle')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shield, title: t('lowerFees'), description: t('lowerFeesDescription') },
            { icon: Clock, title: t('faster'), description: t('fasterDescription') },
            { icon: Eye, title: t('transparent'), description: t('transparentDescription') },
            { icon: Globe, title: t('bilingual'), description: t('bilingualDescription') },
          ].map(({ icon: Icon, title, description }) => (
            <div key={title} className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                <Icon className="h-5 w-5 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
