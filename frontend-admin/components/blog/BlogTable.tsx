'use client'

import Link from 'next/link'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'
import type { BlogPost } from '@/hooks/useBlogPosts'

interface Props {
  posts: BlogPost[]
  onDelete: (id: string) => void
}

export default function BlogTable({ posts, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
            <th className="text-center px-4 py-3 font-medium text-gray-600">Views</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Published</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900 truncate max-w-xs">{post.title}</div>
                {post.excerpt && (
                  <div className="text-xs text-gray-400 truncate max-w-xs">{post.excerpt}</div>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    post.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {post.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500">{post.category || '—'}</td>
              <td className="px-4 py-3 text-center text-gray-500">{post.view_count}</td>
              <td className="px-4 py-3 text-gray-500">
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString()
                  : '—'}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  {post.status === 'published' && (
                    <a
                      href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'}/en/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                      title="View on site"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <Link
                    href={`/blog/edit/${post.id}`}
                    className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm('Delete this post?')) onDelete(post.id)
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
