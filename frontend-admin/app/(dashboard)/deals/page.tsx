'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { useDeals, Payment } from '@/hooks/useDeals'
import StatusBadge from '@/components/admin/StatusBadge'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const dealStatuses = [
  '',
  'pending_legal',
  'active',
  'current',
  'late',
  'default',
  'paid_off',
]

export default function AdminDealsPage() {
  const router = useRouter()
  const { deals, loading, error, fetchDeals, fetchOverdue } = useDeals()
  const [statusFilter, setStatusFilter] = useState('')
  const [overduePayments, setOverduePayments] = useState<Payment[]>([])

  useEffect(() => {
    fetchDeals()
    fetchOverdue().then(setOverduePayments)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleStatusChange(val: string) {
    setStatusFilter(val)
    fetchDeals(val || undefined)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Deals</h1>

      {/* Overdue Alert */}
      {overduePayments.length > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">{overduePayments.length}</span> overdue payment{overduePayments.length !== 1 ? 's' : ''} require attention.
          </p>
        </div>
      )}

      {/* Status Filter */}
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Statuses</option>
          {dealStatuses.filter(Boolean).map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
                <th className="px-4 py-3 font-medium">Deal #</th>
                <th className="px-4 py-3 font-medium">Principal</th>
                <th className="px-4 py-3 font-medium">Rate</th>
                <th className="px-4 py-3 font-medium">Term</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Start Date</th>
                <th className="px-4 py-3 font-medium">Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && deals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : deals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No deals found.
                  </td>
                </tr>
              ) : (
                deals.map((deal) => (
                  <tr
                    key={deal.id}
                    onClick={() => router.push(`/deals/${deal.id}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3 text-primary-600 font-medium">{deal.deal_number}</td>
                    <td className="px-4 py-3 text-gray-700">{fmt.format(deal.principal_amount)}</td>
                    <td className="px-4 py-3 text-gray-700">{deal.interest_rate_monthly}%</td>
                    <td className="px-4 py-3 text-gray-700">{deal.term_months}mo</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={deal.status} type="deal" />
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {deal.start_date ? new Date(deal.start_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{fmt.format(deal.outstanding_principal)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
