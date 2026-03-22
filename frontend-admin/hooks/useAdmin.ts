import { useState, useCallback } from 'react'
import api from '@/lib/api'

export interface DashboardStats {
  total_users: number
  total_borrowers: number
  total_investors: number
  active_applications: number
  pending_documents: number
  interests_expressed: number
}

export interface PipelineItem {
  status: string
  count: number
}

export function useAdmin() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pipeline, setPipeline] = useState<PipelineItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<DashboardStats>('/admin/dashboard/stats')
      setStats(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPipeline = useCallback(async () => {
    try {
      const { data } = await api.get<PipelineItem[]>('/admin/dashboard/pipeline')
      setPipeline(data)
    } catch {
      // silently fail
    }
  }, [])

  return { stats, pipeline, loading, fetchStats, fetchPipeline }
}
