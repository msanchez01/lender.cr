import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Calendar, User, ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getBlogPost } from '@/lib/api'
import { Link } from '@/i18n/navigation'
import JsonLd from '@/components/JsonLd'
import BlogViewTracker from '@/components/BlogViewTracker'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lender.cr'

  try {
    const post = await getBlogPost(slug)
    return {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || '',
      openGraph: {
        type: 'article',
        title: post.seo_title || post.title,
        description: post.seo_description || post.excerpt || '',
        url: `${siteUrl}/${locale}/blog/${slug}`,
        siteName: 'Lender.cr',
        ...(post.featured_image && { images: [{ url: post.featured_image }] }),
        publishedTime: post.published_at || undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.seo_title || post.title,
        description: post.seo_description || post.excerpt || '',
      },
      alternates: {
        canonical: `${siteUrl}/${locale}/blog/${slug}`,
        languages: {
          'en': `${siteUrl}/en/blog/${slug}`,
          'es': `${siteUrl}/es/blog/${slug}`,
          'x-default': `${siteUrl}/en/blog/${slug}`,
        },
      },
    }
  } catch {
    return {}
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const t = await getTranslations('BlogPage')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lender.cr'

  let post
  try {
    post = await getBlogPost(slug)
  } catch {
    notFound()
  }

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString(locale === 'es' ? 'es-CR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="max-w-3xl mx-auto">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt || '',
        ...(post.featured_image && { image: post.featured_image }),
        datePublished: post.published_at,
        dateModified: post.updated_at,
        author: {
          '@type': 'Person',
          name: post.author || 'Lender.cr Team',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Lender.cr',
          url: siteUrl,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${siteUrl}/${locale}/blog/${slug}`,
        },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t('breadcrumbHome'), item: `${siteUrl}/${locale}` },
          { '@type': 'ListItem', position: 2, name: t('breadcrumbBlog'), item: `${siteUrl}/${locale}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title },
        ],
      }} />

      <BlogViewTracker slug={slug} />

      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('backToBlog')}
      </Link>

      {/* Header */}
      <div className="mb-8">
        {post.category && (
          <span className="inline-flex bg-primary-100 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full mb-3">
            {post.category}
          </span>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {formattedDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </span>
          )}
          {post.author && (
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author}
            </span>
          )}
        </div>
      </div>

      {/* Featured image */}
      {post.featured_image && (
        <div className="aspect-[16/9] relative rounded-xl overflow-hidden mb-8">
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <article className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </article>

      {/* Tags */}
      {post.tags && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {post.tags.split(',').map((tag) => (
              <span
                key={tag.trim()}
                className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
