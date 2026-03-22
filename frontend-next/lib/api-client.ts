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

// --- Borrower API ---

import { getAccessToken } from '@/lib/auth'
import type { Property, PropertyList, LoanApplication, LoanApplicationList } from '@/lib/types'

function authHeaders() {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const borrowerApi = {
  // Properties
  listProperties: async (): Promise<PropertyList> => {
    const { data } = await api.get('/borrower/properties', { headers: authHeaders() })
    return data
  },
  getProperty: async (id: string): Promise<Property> => {
    const { data } = await api.get(`/borrower/properties/${id}`, { headers: authHeaders() })
    return data
  },
  createProperty: async (propertyData: Record<string, unknown>): Promise<Property> => {
    const { data } = await api.post('/borrower/properties', propertyData, { headers: authHeaders() })
    return data
  },
  updateProperty: async (id: string, propertyData: Record<string, unknown>): Promise<Property> => {
    const { data } = await api.put(`/borrower/properties/${id}`, propertyData, { headers: authHeaders() })
    return data
  },
  deleteProperty: async (id: string): Promise<void> => {
    await api.delete(`/borrower/properties/${id}`, { headers: authHeaders() })
  },

  // Images
  uploadImage: async (propertyId: string, file: File): Promise<unknown> => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post(`/borrower/properties/${propertyId}/images`, formData, {
      headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
  deleteImage: async (propertyId: string, imageId: string): Promise<void> => {
    await api.delete(`/borrower/properties/${propertyId}/images/${imageId}`, { headers: authHeaders() })
  },

  // Documents
  uploadDocument: async (propertyId: string, file: File, documentType: string): Promise<unknown> => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post(
      `/borrower/properties/${propertyId}/documents?document_type=${encodeURIComponent(documentType)}`,
      formData,
      { headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' } },
    )
    return data
  },
  deleteDocument: async (propertyId: string, docId: string): Promise<void> => {
    await api.delete(`/borrower/properties/${propertyId}/documents/${docId}`, { headers: authHeaders() })
  },

  // Applications
  listApplications: async (status?: string): Promise<LoanApplicationList> => {
    const params = status ? `?status=${status}` : ''
    const { data } = await api.get(`/borrower/applications${params}`, { headers: authHeaders() })
    return data
  },
  getApplication: async (id: string): Promise<LoanApplication> => {
    const { data } = await api.get(`/borrower/applications/${id}`, { headers: authHeaders() })
    return data
  },
  createApplication: async (appData: Record<string, unknown>): Promise<LoanApplication> => {
    const { data } = await api.post('/borrower/applications', appData, { headers: authHeaders() })
    return data
  },
  updateApplication: async (id: string, appData: Record<string, unknown>): Promise<LoanApplication> => {
    const { data } = await api.put(`/borrower/applications/${id}`, appData, { headers: authHeaders() })
    return data
  },
}

// --- Investor API ---

import type { MarketplaceDeal, MarketplaceDealList, InvestorInterest, InvestorInterestWithDeal, PortfolioSummary } from '@/lib/types'

export const investorApi = {
  // Marketplace
  listDeals: async (filters?: Record<string, string | number>): Promise<MarketplaceDealList> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== null) params.append(k, String(v))
      })
    }
    const { data } = await api.get(`/investor/marketplace?${params.toString()}`, { headers: authHeaders() })
    return data
  },
  getDeal: async (id: string): Promise<MarketplaceDeal> => {
    const { data } = await api.get(`/investor/marketplace/${id}`, { headers: authHeaders() })
    return data
  },
  expressInterest: async (appId: string, interestData: Record<string, unknown>): Promise<InvestorInterest> => {
    const { data } = await api.post(`/investor/marketplace/${appId}/interest`, interestData, { headers: authHeaders() })
    return data
  },

  // Portfolio
  getPortfolio: async (): Promise<PortfolioSummary> => {
    const { data } = await api.get('/investor/portfolio', { headers: authHeaders() })
    return data
  },
  listInterests: async (): Promise<InvestorInterestWithDeal[]> => {
    const { data } = await api.get('/investor/portfolio/interests', { headers: authHeaders() })
    return data
  },
}

export default api
