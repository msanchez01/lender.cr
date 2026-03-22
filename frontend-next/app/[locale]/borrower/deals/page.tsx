'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Handshake, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { dealApi } from '@/lib/api-client'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)

interface Deal {
  id: string
  deal_number: string
  principal_amount: number
  interest_rate_monthly: number
  term_months: number
  status: string
  start_date: string | null
  maturity_date: string | null
  outstanding_principal: number
}

const statusColors: Record<string, string> = {
  pending_legal: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  current: 'bg-green-100 text-green-700',
  late: 'bg-yellow-100 text-yellow-700',
  default: 'bg-red-100 text-red-700',
  paid_off: 'bg-emerald-100 text-emerald-700',
}

function formatStatus(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function BorrowerDealsPage() {
  const { user } = useAuth()
  const t = useTranslations('DealsPage')
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await dealApi.listDeals()
        setDeals(data.items || data)
      } catch {
        // keep defaults
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (!user) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  if (deals.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('myDeals')}</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Handshake className="h-10 w-10 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t('noDeals')}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('myDeals')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deals.map((deal) => (
          <Link
            key={deal.id}
            href={`/borrower/deals/${deal.id}`}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-primary-600">#{deal.deal_number}</p>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  statusColors[deal.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {formatStatus(deal.status)}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('principal')}</span>
                <span className="font-medium text-gray-900">{formatCurrency(deal.principal_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('rate')}</span>
                <span className="font-medium text-gray-900">{deal.interest_rate_monthly}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('term')}</span>
                <span className="font-medium text-gray-900">{deal.term_months} months</span>
              </div>
              {deal.start_date && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('startDate')}</span>
                  <span className="text-gray-700">{new Date(deal.start_date).toLocaleDateString()}</span>
                </div>
              )}
              {deal.maturity_date && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('maturityDate')}</span>
                  <span className="text-gray-700">{new Date(deal.maturity_date).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-500">{t('outstanding')}</span>
                <span className="font-semibold text-gray-900">{formatCurrency(deal.outstanding_principal)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
