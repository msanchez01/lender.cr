import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { FileText, BarChart3, Search, Megaphone, Banknote, ArrowRight } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import { Link } from '@/i18n/navigation'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'HowItWorks' })
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lender.cr'

  return {
    title: t('borrowersPageTitle'),
    description: t('borrowersPageDescription'),
    alternates: {
      languages: {
        'en': `${siteUrl}/en/how-it-works/borrowers`,
        'es': `${siteUrl}/es/how-it-works/borrowers`,
        'x-default': `${siteUrl}/en/how-it-works/borrowers`,
      },
    },
  }
}

const STEP_ICONS = [FileText, BarChart3, Search, Megaphone, Banknote]

export default async function BorrowersHowItWorks({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('HowItWorks')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lender.cr'

  const steps = Array.from({ length: 5 }, (_, i) => ({
    title: t(`borrowerStep${i + 1}Title`),
    description: t(`borrowerStep${i + 1}Description`),
    Icon: STEP_ICONS[i],
  }))

  return (
    <div className="max-w-4xl mx-auto">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: t('borrowersPageTitle'),
        description: t('borrowersPageDescription'),
        step: steps.map((step, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: step.title,
          text: step.description,
        })),
      }} />

      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {t('borrowersTitle')}
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          {t('borrowersSubtitle')}
        </p>
      </div>

      <div className="space-y-6 mb-12">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4 md:gap-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className="w-px h-full bg-primary-100 mt-2" />
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex-1 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <step.Icon className="h-5 w-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
              </div>
              <p className="text-sm text-gray-500">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mb-8">
        <Link
          href="/how-it-works/investors"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          {t('viewInvestorFlow')} &rarr;
        </Link>
      </div>

      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl text-white p-8 text-center">
        <h2 className="text-2xl font-bold mb-3">{t('readyToStart')}</h2>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {t('borrowerCta')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
