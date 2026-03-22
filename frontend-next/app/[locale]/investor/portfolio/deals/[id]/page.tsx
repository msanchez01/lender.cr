'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { investorApi } from '@/lib/api-client'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)

interface InvestorPayment {
  id: string
  payment_number: number
  due_date: string
  investor_disbursement_amount: number
  investor_disbursement_date: string | null
  status: string
}

interface InvestorDealDetail {
  id: string
  deal_number: string
  principal_amount: number
  investor_rate_monthly: number
  platform_spread: number
  term_months: number
  status: string
  start_date: string | null
  maturity_date: string | null
  outstanding_principal: number
  payments: InvestorPayment[]
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

export default function InvestorDealDetailPage() {
  const { user } = useAuth()
  const t = useTranslations('InvestorDealsPage')
  const params = useParams()
  const id = params.id as string

  const [deal, setDeal] = useState<InvestorDealDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await investorApi.getFundedDeal(id)
        setDeal(data)
      } catch {
        // keep null
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

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
        <Link
          href="/investor/portfolio/deals"
          className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block"
        >
          {t('backToDeals')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/investor/portfolio/deals" className="text-gray-400 hover:text-gray-600">
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('investmentSummary')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{t('principal')}</p>
            <p className="font-medium text-gold-600">{formatCurrency(deal.principal_amount)}</p>
          </div>
          <div>
            <p className="text-gray-500">{t('investorRate')}</p>
            <p className="font-medium text-gray-900">{deal.investor_rate_monthly}% monthly</p>
          </div>
          <div>
            <p className="text-gray-500">{t('platformSpread')}</p>
            <p className="font-medium text-gray-900">{deal.platform_spread}%</p>
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
          <div>
            <p className="text-gray-500">{t('outstanding')}</p>
            <p className="font-semibold text-gold-600">{formatCurrency(deal.outstanding_principal)}</p>
          </div>
        </div>
      </div>

      {/* Disbursement Schedule */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{t('disbursementSchedule')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">{t('dueDate')}</th>
                <th className="px-4 py-3 font-medium">{t('disbursementAmount')}</th>
                <th className="px-4 py-3 font-medium">{t('disbursementDate')}</th>
                <th className="px-4 py-3 font-medium">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {deal.payments && deal.payments.length > 0 ? (
                deal.payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{payment.payment_number}</td>
                    <td className="px-4 py-3 text-gray-700">{new Date(payment.due_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium text-gold-600">
                      {formatCurrency(payment.investor_disbursement_amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {payment.investor_disbursement_date
                        ? new Date(payment.investor_disbursement_date).toLocaleDateString()
                        : '-'}
                    </td>
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
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
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
