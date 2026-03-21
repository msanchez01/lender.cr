'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useBlogPosts, type BlogPost } from '@/hooks/useBlogPosts'
import BlogEditor from '@/components/blog/BlogEditor'

export default function EditBlogPostPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { fetchPost, updatePost } = useBlogPosts()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchPost(id).then((p) => {
        if (p) setPost(p)
        else router.push('/blog')
        setLoading(false)
      })
    }
  }, [id, fetchPost, router])

  const handleSave = async (data: Partial<BlogPost>) => {
    await updatePost(id, data)
    const updated = await fetchPost(id)
    if (updated) setPost(updated)
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Blog Post</h1>
      <BlogEditor post={post} onSave={handleSave} />
    </div>
  )
}
