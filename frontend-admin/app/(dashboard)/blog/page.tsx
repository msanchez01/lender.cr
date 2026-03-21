'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { useBlogPosts } from '@/hooks/useBlogPosts'
import BlogTable from '@/components/blog/BlogTable'

export default function BlogListPage() {
  const { posts, total, page, pageSize, loading, fetchPosts, deletePost } = useBlogPosts()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    fetchPosts({ search: debounced, status, page: 1 })
  }, [debounced, status, fetchPosts])

  const handleDelete = useCallback(
    async (id: string) => {
      await deletePost(id)
      fetchPosts({ search: debounced, status })
    },
    [deletePost, fetchPosts, debounced, status]
  )

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
        <Link
          href="/blog/new"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No posts found.</div>
      ) : (
        <>
          <BlogTable posts={posts} onDelete={handleDelete} />
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <span>{total} posts total</span>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchPosts({ search: debounced, status, page: page - 1 })}
                  disabled={page <= 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => fetchPosts({ search: debounced, status, page: page + 1 })}
                  disabled={page >= totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
