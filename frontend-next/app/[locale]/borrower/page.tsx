'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Home, FileText, Plus, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { borrowerApi } from '@/lib/api-client'
import ApplicationCard from '@/components/borrower/ApplicationCard'
import type { PropertyListItem, LoanApplication } from '@/lib/types'

export default function BorrowerDashboard() {
  const { user } = useAuth()
  const t = useTranslations('BorrowerDashboard')
  const [properties, setProperties] = useState<PropertyListItem[]>([])
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const [propData, appData] = await Promise.all([
          borrowerApi.listProperties(),
          borrowerApi.listApplications(),
        ])
        setProperties(propData.items)
        setApplications(appData.items)
      } catch {
        // Error handled silently
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (!user) return null

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('welcomeTitle', { name: user.first_name })}
        </h1>
        <p className="text-gray-500 mb-8">{t('welcomeDescription')}</p>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      </div>
    )
  }

  const recentApplications = applications.slice(0, 3)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {t('welcomeTitle', { name: user.first_name })}
      </h1>
      <p className="text-gray-500 mb-8">{t('welcomeDescription')}</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/borrower/properties"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('sidebarProperties')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{properties.length}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <Home className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Link>

        <Link
          href="/borrower/applications"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('sidebarApplications')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{applications.length}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/borrower/properties/new"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Property
        </Link>
        <Link
          href="/borrower/apply"
          className="inline-flex items-center gap-2 border border-primary-200 text-primary-700 hover:bg-primary-50 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {t('applyNow')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Recent Applications */}
      {recentApplications.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('sidebarApplications')}</h2>
            <Link
              href="/borrower/applications"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentApplications.map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{t('noApplications')}</p>
          <Link
            href="/borrower/apply"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            {t('applyNow')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
