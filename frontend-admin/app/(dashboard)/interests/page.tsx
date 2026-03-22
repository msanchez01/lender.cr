'use client'

import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import StatusBadge from '@/components/admin/StatusBadge'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

interface InterestItem {
  id: string
  investor_name: string
  application_number: string
  amount_willing_usd: number
  proposed_rate: number
  message: string | null
  status: string
}

const statusOptions = ['', 'expressed', 'reviewing', 'committed', 'declined', 'withdrawn']

export default function InterestsPage() {
  const [interests, setInterests] = useState<InterestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [rowStatuses, setRowStatuses] = useState<Record<string, string>>({})

  const fetchInterests = useCallback(async (status?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      const { data } = await api.get<InterestItem[]>(`/admin/interests?${params.toString()}`)
      setInterests(data)
      const map: Record<string, string> = {}
      data.forEach((i) => (map[i.id] = i.status))
      setRowStatuses(map)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInterests()
  }, [fetchInterests])

  function handleFilterChange(val: string) {
    setStatusFilter(val)
    fetchInterests(val)
  }

  function handleRowStatusChange(id: string, val: string) {
    setRowStatuses((prev) => ({ ...prev, [id]: val }))
  }

  async function handleSaveStatus(id: string) {
    setUpdatingId(id)
    try {
      await api.put(`/admin/interests/${id}/status`, { status: rowStatuses[id] })
      await fetchInterests(statusFilter)
    } catch {
      // silently fail
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading && interests.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading interests...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Investor Interests</h1>

      {/* Filter */}
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Statuses</option>
          {statusOptions.filter(Boolean).map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {interests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-400">No interests found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
                  <th className="px-4 py-3 font-medium">Investor</th>
                  <th className="px-4 py-3 font-medium">Application #</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Rate</th>
                  <th className="px-4 py-3 font-medium">Message</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {interests.map((interest) => {
                  const current = interest.status
                  const selected = rowStatuses[interest.id] || current
                  const changed = selected !== current
                  return (
                    <tr key={interest.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 font-medium">{interest.investor_name}</td>
                      <td className="px-4 py-3 text-primary-600">{interest.application_number}</td>
                      <td className="px-4 py-3 text-gray-700">{fmt.format(interest.amount_willing_usd)}</td>
                      <td className="px-4 py-3 text-gray-700">{interest.proposed_rate}%</td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{interest.message || '-'}</td>
                      <td className="px-4 py-3">
                        <select
                          value={selected}
                          onChange={(e) => handleRowStatusChange(interest.id, e.target.value)}
                          className="rounded-lg border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="expressed">Expressed</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="committed">Committed</option>
                          <option value="declined">Declined</option>
                          <option value="withdrawn">Withdrawn</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {changed && (
                          <button
                            onClick={() => handleSaveStatus(interest.id)}
                            disabled={updatingId === interest.id}
                            className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                          >
                            {updatingId === interest.id ? 'Saving...' : 'Save'}
                          </button>
                        )}
                        {!changed && (
                          <StatusBadge status={current} type="interest" />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
