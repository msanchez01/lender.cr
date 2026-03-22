'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { useParams } from 'next/navigation'
import { ArrowLeft, FileText, Loader2, Send, XCircle } from 'lucide-react'
import { borrowerApi } from '@/lib/api-client'
import type { LoanApplication } from '@/lib/types'

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

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [application, setApplication] = useState<LoanApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const t = useTranslations('ApplicationsPage')
  const router = useRouter()

  useEffect(() => {
    async function fetch() {
      try {
        const data = await borrowerApi.getApplication(id)
        setApplication(data)
      } catch {
        // Error handled silently
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleSubmit = async () => {
    if (!application) return
    setSubmitting(true)
    try {
      const updated = await borrowerApi.updateApplication(application.id, { status: 'submitted' })
      setApplication(updated)
    } catch {
      // Error handled silently
    } finally {
      setSubmitting(false)
    }
  }

  const handleWithdraw = async () => {
    if (!application) return
    setWithdrawing(true)
    try {
      const updated = await borrowerApi.updateApplication(application.id, { status: 'withdrawn' })
      setApplication(updated)
    } catch {
      // Error handled silently
    } finally {
      setWithdrawing(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!application) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Application not found.</p>
      </div>
    )
  }

  return (
    <div>
      <Link
        href="/borrower/applications"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('backToApplications')}
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-5 w-5 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {t('applicationNumber')}{application.application_number}
            </h1>
          </div>
          <span
            className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
              statusColors[application.status] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {t(`statuses.${application.status}`)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {application.status === 'draft' && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {t('submitApplication')}
            </button>
          )}
          {(application.status === 'draft' || application.status === 'submitted') && (
            <button
              onClick={handleWithdraw}
              disabled={withdrawing}
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {withdrawing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {t('withdrawApplication')}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{t('amount')}</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(application.amount_requested)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{t('term')}</p>
            <p className="text-lg font-semibold text-gray-900">
              {application.preferred_term_months} {t('months')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{t('purpose')}</p>
            <p className="text-sm font-medium text-gray-900">
              {t(`purposes.${application.purpose}`)}
            </p>
          </div>
          {application.preliminary_ltv !== null && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">{t('preliminaryLtv')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {application.preliminary_ltv.toFixed(1)}%
              </p>
            </div>
          )}
          {application.max_interest_rate_monthly !== null && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">{t('maxRateLabel')}</p>
              <p className="text-sm font-medium text-gray-900">
                {application.max_interest_rate_monthly}%
              </p>
            </div>
          )}
          {application.purpose_description && (
            <div className="col-span-2 sm:col-span-3">
              <p className="text-xs text-gray-500 mb-0.5">{t('purposeDescriptionLabel')}</p>
              <p className="text-sm text-gray-700">{application.purpose_description}</p>
            </div>
          )}
        </div>

        {application.rejection_reason && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-700">Rejection Reason</p>
              <p className="text-sm text-red-600 mt-1">{application.rejection_reason}</p>
            </div>
          </div>
        )}

        <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
          {application.submitted_at && (
            <span>Submitted: {new Date(application.submitted_at).toLocaleDateString()}</span>
          )}
          {application.approved_at && (
            <span>Approved: {new Date(application.approved_at).toLocaleDateString()}</span>
          )}
          {application.funded_at && (
            <span>Funded: {new Date(application.funded_at).toLocaleDateString()}</span>
          )}
          <span>Created: {new Date(application.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}
