'use client'

import { useEffect } from 'react'
import { blogApi } from '@/lib/api-client'

export default function BlogViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    blogApi.incrementViewCount(slug).catch(() => {})
  }, [slug])

  return null
}
