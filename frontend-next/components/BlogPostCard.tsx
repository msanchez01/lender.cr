'use client'

import { useLocale } from 'next-intl'
import Image from 'next/image'
import { Calendar, User, ImageOff } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { BlogPost } from '@/lib/api'

export default function BlogPostCard({ post }: { post: BlogPost }) {
  const locale = useLocale()

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString(locale === 'es' ? 'es-CR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-200"
    >
      <div className="aspect-[16/9] relative bg-gray-100 overflow-hidden">
        {post.featured_image ? (
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageOff className="h-8 w-8 text-gray-300" />
          </div>
        )}
        {post.category && (
          <span className="absolute top-3 left-3 bg-primary-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {post.category}
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          {formattedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
          )}
          {post.author && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {post.author}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
