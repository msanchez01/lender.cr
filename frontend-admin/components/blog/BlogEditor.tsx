'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Save, Send } from 'lucide-react'
import type { BlogPost } from '@/hooks/useBlogPosts'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

interface Props {
  post?: BlogPost | null
  onSave: (data: Partial<BlogPost>) => Promise<void>
  isNew?: boolean
}

export default function BlogEditor({ post, onSave, isNew = false }: Props) {
  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [content, setContent] = useState(post?.content || '')
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [category, setCategory] = useState(post?.category || '')
  const [author, setAuthor] = useState(post?.author || '')
  const [tags, setTags] = useState(post?.tags || '')
  const [featuredImage, setFeaturedImage] = useState(post?.featured_image || '')
  const [seoTitle, setSeoTitle] = useState(post?.seo_title || '')
  const [seoDescription, setSeoDescription] = useState(post?.seo_description || '')
  const [status, setStatus] = useState(post?.status || 'draft')
  const [autoSlug, setAutoSlug] = useState(isNew)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (autoSlug && title) {
      setSlug(slugify(title))
    }
  }, [title, autoSlug])

  const canSave = title.trim() && slug.trim() && content.trim()

  const handleSave = async (publishStatus?: string) => {
    if (!canSave) return
    setSaving(true)
    try {
      await onSave({
        title,
        slug,
        content,
        excerpt: excerpt || undefined,
        category: category || undefined,
        author: author || undefined,
        tags: tags || undefined,
        featured_image: featuredImage || undefined,
        seo_title: seoTitle || undefined,
        seo_description: seoDescription || undefined,
        status: publishStatus || status,
      } as Partial<BlogPost>)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Title + Slug */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug
            {isNew && (
              <button
                type="button"
                onClick={() => setAutoSlug(!autoSlug)}
                className="ml-2 text-xs text-primary-600"
              >
                {autoSlug ? '(auto — click to edit manually)' : '(manual — click for auto)'}
              </button>
            )}
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setAutoSlug(false) }}
            placeholder="post-slug"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Markdown Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <div data-color-mode="light">
          <MDEditor value={content} onChange={(v) => setContent(v || '')} height={500} />
        </div>
      </div>

      {/* Status (edit only) */}
      {!isNew && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <div className="flex gap-4">
            {['draft', 'published'].map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className="text-primary-600"
                />
                <span className="capitalize">{s}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Guides"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author name"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="lending, costa-rica, guide"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
          <input
            type="text"
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief summary for listing cards and SEO..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
      </div>

      {/* SEO */}
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700">SEO</h3>
        <div>
          <label className="block text-xs text-gray-500 mb-1">SEO Title</label>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="Custom title for search engines"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">SEO Description</label>
          <textarea
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder="Custom description for search engines"
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {isNew ? (
          <>
            <button
              onClick={() => handleSave('draft')}
              disabled={!canSave || saving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-medium rounded-lg text-sm transition-colors"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={!canSave || saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg text-sm transition-colors"
            >
              <Send className="h-4 w-4" />
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          </>
        ) : (
          <button
            onClick={() => handleSave()}
            disabled={!canSave || saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg text-sm transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>
    </div>
  )
}
