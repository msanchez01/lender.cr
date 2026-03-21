import { useState, useCallback } from 'react'
import api from '@/lib/api'

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  category: string | null
  tags: string | null
  featured_image: string | null
  author: string | null
  seo_title: string | null
  seo_description: string | null
  status: string
  view_count: number
  published_at: string | null
  created_at: string
  updated_at: string
}

interface BlogPostList {
  items: BlogPost[]
  total: number
  page: number
  page_size: number
}

export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchPosts = useCallback(
    async (params?: { status?: string; category?: string; search?: string; page?: number }) => {
      setLoading(true)
      setError('')
      try {
        const searchParams = new URLSearchParams()
        searchParams.append('page', String(params?.page || page))
        searchParams.append('page_size', String(pageSize))
        if (params?.status) searchParams.append('status', params.status)
        if (params?.category) searchParams.append('category', params.category)
        if (params?.search) searchParams.append('search', params.search)

        const { data } = await api.get<BlogPostList>(`/blog/admin/all?${searchParams.toString()}`)
        setPosts(data.items)
        setTotal(data.total)
        if (params?.page) setPage(params.page)
      } catch {
        setError('Failed to load posts.')
      } finally {
        setLoading(false)
      }
    },
    [page, pageSize]
  )

  const fetchPost = useCallback(async (id: string): Promise<BlogPost | null> => {
    try {
      const { data } = await api.get<BlogPost>(`/blog/admin/${id}`)
      return data
    } catch {
      return null
    }
  }, [])

  const createPost = useCallback(async (postData: Partial<BlogPost>): Promise<BlogPost> => {
    const { data } = await api.post<BlogPost>('/blog/', postData)
    return data
  }, [])

  const updatePost = useCallback(async (id: string, postData: Partial<BlogPost>): Promise<BlogPost> => {
    const { data } = await api.put<BlogPost>(`/blog/${id}`, postData)
    return data
  }, [])

  const deletePost = useCallback(async (id: string): Promise<void> => {
    await api.delete(`/blog/${id}`)
  }, [])

  const fetchCategories = useCallback(async (): Promise<string[]> => {
    try {
      const { data } = await api.get<string[]>('/blog/admin/categories')
      return data
    } catch {
      return []
    }
  }, [])

  return {
    posts, total, page, pageSize, loading, error,
    fetchPosts, fetchPost, createPost, updatePost, deletePost, fetchCategories, setPage,
  }
}
