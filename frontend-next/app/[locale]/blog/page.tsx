import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { BookOpen } from 'lucide-react'
import { getBlogPosts } from '@/lib/api'
import BlogPostCard from '@/components/BlogPostCard'

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

  let blogData = null
  try {
    blogData = await getBlogPosts({ page_size: 50 })
  } catch {
    // API unavailable — show empty state
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {t('pageTitle')}
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          {t('pageDescription')}
        </p>
      </div>

      {blogData && blogData.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {blogData.items.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-7 w-7 text-primary-600" />
          </div>
          <p className="text-gray-500">{t('noPosts')}</p>
        </div>
      )}
    </div>
  )
}
