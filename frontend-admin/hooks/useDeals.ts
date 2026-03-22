import { useState, useCallback } from 'react'
import api from '@/lib/api'

export interface Deal {
  id: string
  deal_number: string
  application_id: string
  investor_interest_id: string
  borrower_name: string
  borrower_email: string
  investor_name: string
  investor_email: string
  principal_amount: number
  interest_rate_monthly: number
  investor_rate_monthly: number
  platform_spread: number
  origination_fee_pct: number
  origination_fee_amount: number
  document_fee: number
  servicing_fee_pct: number
  term_months: number
  monthly_payment: number
  start_date: string | null
  maturity_date: string | null
  ltv_ratio: number | null
  status: string
  outstanding_principal: number
  legal_contract_url: string | null
  notary_date: string | null
  disbursement_date: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  deal_id: string
  payment_number: number
  due_date: string
  amount_due: number
  interest_portion: number
  principal_portion: number
  servicing_fee_portion: number
  investor_disbursement_amount: number
  amount_paid: number | null
  paid_date: string | null
  payment_method: string | null
  payment_reference: string | null
  investor_disbursement_date: string | null
  status: string
  deal_number?: string
}

interface DealList {
  items: Deal[]
  total: number
}

interface PaymentList {
  items: Payment[]
  total: number
}

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchDeals = useCallback(async (status?: string) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      const { data } = await api.get<DealList>(`/admin/deals?${params.toString()}`)
      setDeals(data.items)
      setTotal(data.total)
    } catch {
      setError('Failed to load deals.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDeal = useCallback(async (id: string): Promise<Deal | null> => {
    try {
      const { data } = await api.get<Deal>(`/admin/deals/${id}`)
      return data
    } catch {
      return null
    }
  }, [])

  const createDeal = useCallback(async (dealData: Record<string, unknown>): Promise<Deal | null> => {
    try {
      const { data } = await api.post<Deal>('/admin/deals', dealData)
      return data
    } catch {
      return null
    }
  }, [])

  const updateDeal = useCallback(async (id: string, dealData: Record<string, unknown>): Promise<boolean> => {
    try {
      await api.put(`/admin/deals/${id}`, dealData)
      return true
    } catch {
      return false
    }
  }, [])

  const fetchPayments = useCallback(async (dealId?: string): Promise<Payment[]> => {
    try {
      const params = dealId ? `?deal_id=${dealId}` : ''
      const { data } = await api.get<PaymentList>(`/admin/payments${params}`)
      return data.items
    } catch {
      return []
    }
  }, [])

  const updatePayment = useCallback(
    async (id: string, paymentData: Record<string, unknown>): Promise<boolean> => {
      try {
        await api.put(`/admin/payments/${id}`, paymentData)
        return true
      } catch {
        return false
      }
    },
    []
  )

  const fetchOverdue = useCallback(async (): Promise<Payment[]> => {
    try {
      const { data } = await api.get<Payment[]>('/admin/payments/overdue')
      return Array.isArray(data) ? data : (data as PaymentList).items || []
    } catch {
      return []
    }
  }, [])

  return {
    deals,
    total,
    loading,
    error,
    fetchDeals,
    fetchDeal,
    createDeal,
    updateDeal,
    fetchPayments,
    updatePayment,
    fetchOverdue,
  }
}
