import { useState, useCallback } from 'react'
import api from '@/lib/api'

export interface Application {
  id: string
  application_number: string
  borrower_name: string
  borrower_email: string
  borrower_phone: string
  borrower_kyc_verified: boolean
  amount_requested: number
  preliminary_ltv: number | null
  final_ltv: number | null
  preferred_term_months: number
  purpose: string
  status: string
  admin_notes: string | null
  rejection_reason: string | null
  property_type: string
  property_address: string
  property_city: string
  property_value_usd: number
  property_images: string[]
  property_documents: { id: string; type: string; file_name: string; file_url: string; verified: boolean }[]
  appraisals: Appraisal[]
  interests: Interest[]
  created_at: string
  updated_at: string
}

export interface Appraisal {
  id: string
  appraiser_name: string
  appraiser_company: string
  appraised_value_usd: number
  appraisal_date: string
  status: string
  notes: string | null
  cost_usd: number
}

export interface Interest {
  id: string
  investor_name: string
  amount_willing_usd: number
  proposed_rate: number
  message: string | null
  status: string
}

interface ApplicationList {
  items: Application[]
  total: number
  page: number
  page_size: number
}

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchApplications = useCallback(
    async (params?: { status?: string; search?: string; page?: number }) => {
      setLoading(true)
      setError('')
      try {
        const searchParams = new URLSearchParams()
        searchParams.append('page', String(params?.page || page))
        searchParams.append('page_size', String(pageSize))
        if (params?.status) searchParams.append('status', params.status)
        if (params?.search) searchParams.append('search', params.search)

        const { data } = await api.get<ApplicationList>(`/admin/applications?${searchParams.toString()}`)
        setApplications(data.items)
        setTotal(data.total)
        if (params?.page) setPage(params.page)
      } catch {
        setError('Failed to load applications.')
      } finally {
        setLoading(false)
      }
    },
    [page, pageSize]
  )

  const fetchApplication = useCallback(async (id: string): Promise<Application | null> => {
    try {
      const { data } = await api.get<Application>(`/admin/applications/${id}`)
      return data
    } catch {
      return null
    }
  }, [])

  const updateStatus = useCallback(
    async (
      id: string,
      payload: { status: string; admin_notes?: string; rejection_reason?: string }
    ): Promise<boolean> => {
      try {
        await api.put(`/admin/applications/${id}/status`, payload)
        return true
      } catch {
        return false
      }
    },
    []
  )

  const recordAppraisal = useCallback(
    async (
      id: string,
      data: {
        appraiser_name: string
        appraiser_company: string
        appraised_value_usd: number
        appraisal_date: string
        status: string
        notes?: string
        cost_usd: number
      }
    ): Promise<boolean> => {
      try {
        await api.post(`/admin/applications/${id}/appraisal`, data)
        return true
      } catch {
        return false
      }
    },
    []
  )

  return {
    applications,
    total,
    page,
    pageSize,
    loading,
    error,
    fetchApplications,
    fetchApplication,
    updateStatus,
    recordAppraisal,
    setPage,
  }
}
