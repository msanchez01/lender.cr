'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { dealApi } from '@/lib/api-client'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)

interface Payment {
  id: string
  payment_number: number
  due_date: string
  amount_due: number
  interest_portion: number
  principal_portion: number
  servicing_fee_portion: number
  status: string
}

interface DealDetail {
  id: string
  deal_number: string
  principal_amount: number
  interest_rate_monthly: number
  term_months: number
  status: string
  start_date: string | null
  maturity_date: string | null
  ltv_ratio: number | null
  outstanding_principal: number
  payments: Payment[]
}

const dealStatusColors: Record<string, string> = {
  pending_legal: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  current: 'bg-green-100 text-green-700',
  late: 'bg-yellow-100 text-yellow-700',
  default: 'bg-red-100 text-red-700',
  paid_off: 'bg-emerald-100 text-emerald-700',
}

const paymentStatusColors: Record<string, string> = {
  scheduled: 'bg-gray-100 text-gray-700',
  pending: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  late: 'bg-yellow-100 text-yellow-700',
  missed: 'bg-red-100 text-red-700',
}

function formatStatus(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function BorrowerDealDetailPage() {
  const { user } = useAuth()
  const t = useTranslations('DealsPage')
  const params = useParams()
  const id = params.id as string

  const [deal, setDeal] = useState<DealDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await dealApi.getDeal(id)
        setDeal(data)
      } catch {
        // keep null
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleDownload(type: 'agreement' | 'schedule') {
    setDownloading(type)
    try {
      const blob =
        type === 'agreement'
          ? await dealApi.downloadAgreement(id)
          : await dealApi.downloadSchedule(id)
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.download = type === 'agreement' ? `loan-agreement-${deal?.deal_number}.pdf` : `payment-schedule-${deal?.deal_number}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      // download failed
    } finally {
      setDownloading(null)
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{t('dealNotFound')}</p>
        <Link href="/borrower/deals" className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block">
          {t('backToDeals')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/borrower/deals" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('deal')} #{deal.deal_number}
        </h1>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            dealStatusColors[deal.status] || 'bg-gray-100 text-gray-700'
          }`}
        >
          {formatStatus(deal.status)}
        </span>
      </div>

      {/* Deal Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dealSummary')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{t('principal')}</p>
            <p className="font-medium text-gray-900">{formatCurrency(deal.principal_amount)}</p>
          </div>
          <div>
            <p className="text-gray-500">{t('rate')}</p>
            <p className="font-medium text-gray-900">{deal.interest_rate_monthly}% monthly</p>
          </div>
          <div>
            <p className="text-gray-500">{t('term')}</p>
            <p className="font-medium text-gray-900">{deal.term_months} months</p>
          </div>
          {deal.start_date && (
            <div>
              <p className="text-gray-500">{t('startDate')}</p>
              <p className="font-medium text-gray-900">{new Date(deal.start_date).toLocaleDateString()}</p>
            </div>
          )}
          {deal.maturity_date && (
            <div>
              <p className="text-gray-500">{t('maturityDate')}</p>
              <p className="font-medium text-gray-900">{new Date(deal.maturity_date).toLocaleDateString()}</p>
            </div>
          )}
          {deal.ltv_ratio != null && (
            <div>
              <p className="text-gray-500">{t('ltv')}</p>
              <p className="font-medium text-gray-900">{deal.ltv_ratio}%</p>
            </div>
          )}
          <div>
            <p className="text-gray-500">{t('outstanding')}</p>
            <p className="font-semibold text-gray-900">{formatCurrency(deal.outstanding_principal)}</p>
          </div>
        </div>
      </div>

      {/* Download Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => handleDownload('agreement')}
          disabled={downloading === 'agreement'}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {downloading === 'agreement' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {t('downloadAgreement')}
        </button>
        <button
          onClick={() => handleDownload('schedule')}
          disabled={downloading === 'schedule'}
          className="inline-flex items-center gap-2 border border-primary-200 text-primary-700 hover:bg-primary-50 font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {downloading === 'schedule' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {t('downloadSchedule')}
        </button>
      </div>

      {/* Payment Schedule */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{t('paymentSchedule')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">{t('dueDate')}</th>
                <th className="px-4 py-3 font-medium">{t('amountDue')}</th>
                <th className="px-4 py-3 font-medium">{t('interest')}</th>
                <th className="px-4 py-3 font-medium">{t('principalPortion')}</th>
                <th className="px-4 py-3 font-medium">{t('servicingFee')}</th>
                <th className="px-4 py-3 font-medium">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {deal.payments && deal.payments.length > 0 ? (
                deal.payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{payment.payment_number}</td>
                    <td className="px-4 py-3 text-gray-700">{new Date(payment.due_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(payment.amount_due)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatCurrency(payment.interest_portion)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatCurrency(payment.principal_portion)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatCurrency(payment.servicing_fee_portion)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          paymentStatusColors[payment.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {formatStatus(payment.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    {t('noPayments')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
