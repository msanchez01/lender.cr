import { useState, useCallback } from 'react'
import api from '@/lib/api'

export interface Appraiser {
  id: string
  company_name: string
  appraiser_name: string
  phone: string | null
  email: string | null
  license_number: string | null
  specialties: string | null
  regions: string | null
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

interface AppraiserList {
  items: Appraiser[]
  total: number
}

export function useAppraisers() {
  const [appraisers, setAppraisers] = useState<Appraiser[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchAppraisers = useCallback(
    async (params?: { is_active?: boolean; search?: string }) => {
      setLoading(true)
      setError('')
      try {
        const searchParams = new URLSearchParams()
        if (params?.is_active !== undefined)
          searchParams.append('is_active', String(params.is_active))
        if (params?.search) searchParams.append('search', params.search)

        const { data } = await api.get<AppraiserList>(
          `/admin/appraisers?${searchParams.toString()}`
        )
        setAppraisers(data.items)
        setTotal(data.total)
      } catch {
        setError('Failed to load appraisers.')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const fetchAppraiser = useCallback(async (id: string): Promise<Appraiser | null> => {
    try {
      const { data } = await api.get<Appraiser>(`/admin/appraisers/${id}`)
      return data
    } catch {
      return null
    }
  }, [])

  const createAppraiser = useCallback(async (appraiserData: Partial<Appraiser>): Promise<Appraiser> => {
    const { data } = await api.post<Appraiser>('/admin/appraisers', appraiserData)
    return data
  }, [])

  const updateAppraiser = useCallback(async (id: string, appraiserData: Partial<Appraiser>): Promise<Appraiser> => {
    const { data } = await api.put<Appraiser>(`/admin/appraisers/${id}`, appraiserData)
    return data
  }, [])

  const deleteAppraiser = useCallback(async (id: string): Promise<void> => {
    await api.delete(`/admin/appraisers/${id}`)
  }, [])

  return {
    appraisers,
    total,
    loading,
    error,
    fetchAppraisers,
    fetchAppraiser,
    createAppraiser,
    updateAppraiser,
    deleteAppraiser,
  }
}
