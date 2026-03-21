import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { BookOpen, ArrowLeft } from 'lucide-react'
import { Link } from '@/i18n/navigation'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'BlogPage' })
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lender.cr'

  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
    alternates: {
      languages: {
        'en': `${siteUrl}/en/blog`,
        'es': `${siteUrl}/es/blog`,
        'x-default': `${siteUrl}/en/blog`,
      },
    },
  }
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('BlogPage')

  return (
    <div className="max-w-4xl mx-auto text-center py-16">
      <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-6">
        <BookOpen className="h-7 w-7 text-primary-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('comingSoonTitle')}</h1>
      <p className="text-gray-500 max-w-lg mx-auto mb-8">{t('comingSoonDescription')}</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('pageTitle')}
      </Link>
    </div>
  )
}
