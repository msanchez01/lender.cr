'use client'

import { useEffect, useState } from 'react'
import { Users, FileText, FileCheck, Heart } from 'lucide-react'
import { useAdmin } from '@/hooks/useAdmin'
import { useApplications, Application } from '@/hooks/useApplications'
import StatusBadge from '@/components/admin/StatusBadge'
import Link from 'next/link'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export default function DashboardPage() {
  const { stats, pipeline, loading, fetchStats, fetchPipeline } = useAdmin()
  const { applications, fetchApplications } = useApplications()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    Promise.all([fetchStats(), fetchPipeline(), fetchApplications({ page: 1 })]).then(() =>
      setReady(true)
    )
  }, [fetchStats, fetchPipeline, fetchApplications])

  if (loading && !ready) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading dashboard...</div>
  }

  const kpis = [
    { label: 'Total Users', value: stats?.total_users ?? 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active Applications', value: stats?.active_applications ?? 0, icon: FileText, color: 'text-primary-600 bg-primary-50' },
    { label: 'Pending Documents', value: stats?.pending_documents ?? 0, icon: FileCheck, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Interests', value: stats?.interests_expressed ?? 0, icon: Heart, color: 'text-pink-600 bg-pink-50' },
  ]

  const recentApps = applications.slice(0, 5)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4"
            >
              <div className={`rounded-lg p-3 ${kpi.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{kpi.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pipeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Pipeline</h2>
        {pipeline.length === 0 ? (
          <p className="text-sm text-gray-400">No pipeline data available.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {pipeline.map((item) => (
              <div key={item.status} className="flex items-center gap-2">
                <StatusBadge status={item.status} type="application" />
                <span className="text-sm font-medium text-gray-700">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
          <Link href="/applications" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all
          </Link>
        </div>
        {recentApps.length === 0 ? (
          <p className="text-sm text-gray-400">No applications yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-2 font-medium">App #</th>
                  <th className="pb-2 font-medium">Borrower</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentApps.map((app: Application) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="py-2">
                      <Link href={`/applications/${app.id}`} className="text-primary-600 hover:underline">
                        {app.application_number}
                      </Link>
                    </td>
                    <td className="py-2 text-gray-700">{app.borrower_name}</td>
                    <td className="py-2 text-gray-700">{fmt.format(app.loan_amount_usd)}</td>
                    <td className="py-2">
                      <StatusBadge status={app.status} type="application" />
                    </td>
                    <td className="py-2 text-gray-400">{new Date(app.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
