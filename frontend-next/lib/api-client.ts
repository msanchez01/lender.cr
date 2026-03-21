import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// --- Public API ---

export const publicApi = {
  getHealth: async (): Promise<{ status: string }> => {
    const response = await api.get('/public/health')
    return response.data
  },
}

// --- Contact API ---

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  message: string
  user_type: 'borrower' | 'investor' | 'partner' | 'other'
  turnstile_token?: string
}

export const contactApi = {
  submitContact: async (data: ContactFormData): Promise<{ success: boolean }> => {
    const response = await api.post('/public/contact', data)
    return response.data
  },
}

// --- Blog API ---

export const blogApi = {
  incrementViewCount: async (slug: string): Promise<void> => {
    await api.post(`/blog/${slug}/view`)
  },
}

export default api
