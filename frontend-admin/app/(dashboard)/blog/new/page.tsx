'use client'

import { useRouter } from 'next/navigation'
import { useBlogPosts } from '@/hooks/useBlogPosts'
import BlogEditor from '@/components/blog/BlogEditor'
import type { BlogPost } from '@/hooks/useBlogPosts'

export default function NewBlogPostPage() {
  const router = useRouter()
  const { createPost } = useBlogPosts()

  const handleSave = async (data: Partial<BlogPost>) => {
    const post = await createPost(data)
    router.push(`/blog/edit/${post.id}`)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Blog Post</h1>
      <BlogEditor onSave={handleSave} isNew />
    </div>
  )
}
