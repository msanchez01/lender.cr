import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { LOCATION_SLUGS } from '@/lib/data/locations'
import { getBlogPosts } from '@/lib/api'

const locales = routing.locales

function localizedEntry(
  siteUrl: string,
  path: string,
  opts: { lastModified?: Date; changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency']; priority?: number },
): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {}
  for (const locale of locales) {
    languages[locale] = `${siteUrl}/${locale}${path}`
  }
  languages['x-default'] = `${siteUrl}/en${path}`

  return {
    url: `${siteUrl}/en${path}`,
    lastModified: opts.lastModified ?? new Date(),
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    alternates: { languages },
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lender.cr'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    localizedEntry(siteUrl, '', { changeFrequency: 'daily', priority: 1 }),
    localizedEntry(siteUrl, '/how-it-works/borrowers', { changeFrequency: 'monthly', priority: 0.8 }),
    localizedEntry(siteUrl, '/how-it-works/investors', { changeFrequency: 'monthly', priority: 0.8 }),
    localizedEntry(siteUrl, '/calculator', { changeFrequency: 'monthly', priority: 0.8 }),
    localizedEntry(siteUrl, '/blog', { changeFrequency: 'weekly', priority: 0.7 }),
    localizedEntry(siteUrl, '/about', { changeFrequency: 'monthly', priority: 0.6 }),
    localizedEntry(siteUrl, '/contact', { changeFrequency: 'monthly', priority: 0.6 }),
  ]

  // Location landing pages
  const locationPages: MetadataRoute.Sitemap = LOCATION_SLUGS.map((slug) =>
    localizedEntry(siteUrl, `/hard-money-loans/${slug}`, { changeFrequency: 'monthly', priority: 0.7 })
  )

  // Dynamic blog pages
  const blogPages: MetadataRoute.Sitemap = []
  try {
    const blogData = await getBlogPosts({ page_size: 100 })
    for (const post of blogData.items) {
      blogPages.push(
        localizedEntry(siteUrl, `/blog/${post.slug}`, {
          lastModified: new Date(post.updated_at),
          changeFrequency: 'monthly',
          priority: 0.7,
        })
      )
    }
  } catch {
    // API unavailable — skip blog entries
  }

  return [...staticPages, ...locationPages, ...blogPages]
}
