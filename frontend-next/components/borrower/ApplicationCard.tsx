'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { FileText, ArrowRight } from 'lucide-react'
import type { LoanApplication } from '@/lib/types'

interface ApplicationCardProps {
  application: LoanApplication
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  appraisal_ordered: 'bg-yellow-100 text-yellow-700',
  appraisal_complete: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  funded: 'bg-emerald-100 text-emerald-700',
  withdrawn: 'bg-gray-100 text-gray-700',
  matching: 'bg-purple-100 text-purple-700',
  expired: 'bg-gray-100 text-gray-700',
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
  const t = useTranslations('ApplicationsPage')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Link
      href={`/borrower/applications/${application.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary-600" />
          <span className="text-sm font-medium text-gray-900">
            {t('applicationNumber')}{application.application_number}
          </span>
        </div>
        <span
          className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
            statusColors[application.status] || 'bg-gray-100 text-gray-700'
          }`}
        >
          {t(`statuses.${application.status}`)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <p className="text-xs text-gray-500">{t('amount')}</p>
          <p className="font-semibold text-gray-900">
            {formatCurrency(application.amount_requested)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{t('purpose')}</p>
          <p className="font-medium text-gray-700">
            {t(`purposes.${application.purpose}`)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{t('term')}</p>
          <p className="font-medium text-gray-700">
            {application.preferred_term_months} {t('months')}
          </p>
        </div>
        {application.preliminary_ltv !== null && (
          <div>
            <p className="text-xs text-gray-500">{t('ltv')}</p>
            <p className="font-medium text-gray-700">
              {Number(application.preliminary_ltv).toFixed(1)}%
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end text-xs text-primary-600 font-medium">
        <span className="flex items-center gap-1">
          View details
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}
