'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { TrendingUp, DollarSign, Percent, ArrowRight, Loader2 } from 'lucide-react'
import { investorApi } from '@/lib/api-client'
import type { PortfolioSummary } from '@/lib/types'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)

export default function ReturnsPage() {
  const t = useTranslations('ReturnsPage')

  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await investorApi.getPortfolio()
        setPortfolio(data)
      } catch {
        // keep defaults
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  const summary = portfolio || {
    total_invested: 0,
    active_deals_count: 0,
    interests_expressed: 0,
    interests_committed: 0,
    total_interest_earned: 0,
    avg_annual_return: 0,
  }

  const cards = [
    {
      label: t('monthlyIncome'),
      value: formatCurrency(0),
      icon: DollarSign,
      color: 'text-gold-600',
    },
    {
      label: t('totalEarned'),
      value: formatCurrency(summary.total_interest_earned),
      icon: TrendingUp,
      color: 'text-success-600',
    },
    {
      label: t('avgAnnualReturn'),
      value: `${Number(summary.avg_annual_return).toFixed(1)}%`,
      icon: Percent,
      color: 'text-primary-600',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('pageTitle')}</h1>
      <p className="text-gray-500 mb-6">{t('pageDescription')}</p>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-sm text-gray-500">{label}</span>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Message */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <TrendingUp className="h-10 w-10 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 font-medium mb-2">{t('noReturnsTitle')}</p>
        <p className="text-sm text-gray-500 mb-6">{t('noReturnsDescription')}</p>
        <Link
          href="/investor/marketplace"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          {t('browseMarketplace')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
