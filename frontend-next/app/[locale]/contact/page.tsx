import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Mail, MessageCircle, Clock } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import ContactForm from '@/components/ContactForm'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ContactPage' })
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lender.cr'

  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
    alternates: {
      languages: {
        'en': `${siteUrl}/en/contact`,
        'es': `${siteUrl}/es/contact`,
        'x-default': `${siteUrl}/en/contact`,
      },
    },
  }
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('ContactPage')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lender.cr'

  const infoCards = [
    { icon: Mail, title: t('emailTitle'), value: t('emailValue') },
    { icon: MessageCircle, title: t('whatsappTitle'), value: t('whatsappValue') },
    { icon: Clock, title: t('responseTimeTitle'), value: t('responseTimeValue') },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'info@lender.cr',
        url: `${siteUrl}/${locale}/contact`,
        areaServed: { '@type': 'Country', name: 'Costa Rica' },
        availableLanguage: ['English', 'Spanish'],
      }} />

      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {t('pageTitle')}
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          {t('pageDescription')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {infoCards.map(({ icon: Icon, title, value }) => (
          <div key={title} className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-3">
              <Icon className="h-5 w-5 text-primary-600" />
            </div>
            <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t('formTitle')}</h2>
        <ContactForm />
      </div>
    </div>
  )
}
