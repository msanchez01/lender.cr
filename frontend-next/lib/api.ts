const API_BASE = process.env.API_URL || 'https://api.lender.cr'

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// --- Public ---

export async function getHealth(): Promise<{ status: string }> {
  return fetchApi('/public/health')
}

// --- Blog ---

export async function getBlogPosts(
  filters: { page?: number; page_size?: number } = {}
): Promise<{ items: BlogPost[]; total: number; page: number; page_size: number }> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  })
  return fetchApi(`/blog/?${params.toString()}`, {
    next: { revalidate: 300 },
  })
}

export async function getBlogPost(slug: string): Promise<BlogPost> {
  return fetchApi(`/blog/${slug}`, {
    next: { revalidate: 300 },
  })
}

// --- Types (temporary, will move to types.ts) ---

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string | null
  category: string | null
  tags: string | null
  author: string | null
  seo_title: string | null
  seo_description: string | null
  status: string
  published_at: string | null
  created_at: string
  updated_at: string
}
