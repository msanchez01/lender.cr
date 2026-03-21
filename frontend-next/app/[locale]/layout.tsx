import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { routing, type Locale } from '@/i18n/routing'
import Navigation from '@/components/Navigation'
import AnalyticsEvents from '@/components/AnalyticsEvents'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const viewport: Viewport = {
  themeColor: '#1d4ed8',
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lender.cr'

  return {
    title: {
      default: t('title'),
      template: '%s | Lender.cr',
    },
    description: t('description'),
    metadataBase: new URL(siteUrl),
    openGraph: {
      type: 'website',
      siteName: 'Lender.cr',
      locale: locale === 'es' ? 'es_CR' : 'en_US',
      images: [{ url: '/logo.png', width: 600, height: 600, alt: 'Lender.cr' }],
    },
    twitter: {
      card: 'summary_large_image',
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      languages: {
        'en': `${siteUrl}/en`,
        'es': `${siteUrl}/es`,
        'x-default': `${siteUrl}/en`,
      },
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as Locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'Common' })

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navigation />
            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex-1">
              {children}
            </main>
            <footer className="bg-white border-t border-gray-100 mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <p className="text-center text-gray-400 text-sm">
                  &copy; {new Date().getFullYear()} Lender.cr. {t('allRightsReserved')}
                </p>
              </div>
            </footer>
          </div>
          <AnalyticsEvents />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
