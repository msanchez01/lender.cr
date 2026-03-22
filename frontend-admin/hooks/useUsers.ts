import { useState, useCallback } from 'react'
import api from '@/lib/api'

export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  whatsapp_number: string | null
  role: string
  status: string
  preferred_language: string
  kyc_verified: boolean
  email_verified: boolean
  borrower_profile: {
    type: string
    nationality: string
    residency_status: string
    application_count: number
    property_count: number
  } | null
  investor_profile: {
    accreditation_status: string
    min_investment_usd: number
    max_investment_usd: number
    interest_count: number
  } | null
  created_at: string
  updated_at: string
}

interface UserList {
  items: User[]
  total: number
  page: number
  page_size: number
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [loading, setLoading] = useState(false)

  const fetchUsers = useCallback(
    async (params?: { role?: string; status?: string; search?: string; page?: number }) => {
      setLoading(true)
      try {
        const searchParams = new URLSearchParams()
        searchParams.append('page', String(params?.page || page))
        searchParams.append('page_size', String(pageSize))
        if (params?.role) searchParams.append('role', params.role)
        if (params?.status) searchParams.append('status', params.status)
        if (params?.search) searchParams.append('search', params.search)

        const { data } = await api.get<UserList>(`/admin/users?${searchParams.toString()}`)
        setUsers(data.items)
        setTotal(data.total)
        if (params?.page) setPage(params.page)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    },
    [page, pageSize]
  )

  const fetchUser = useCallback(async (id: string): Promise<User | null> => {
    try {
      const { data } = await api.get<User>(`/admin/users/${id}`)
      return data
    } catch {
      return null
    }
  }, [])

  const updateUser = useCallback(
    async (id: string, payload: Partial<User>): Promise<boolean> => {
      try {
        await api.put(`/admin/users/${id}`, payload)
        return true
      } catch {
        return false
      }
    },
    []
  )

  return { users, total, page, pageSize, loading, fetchUsers, fetchUser, updateUser, setPage }
}
