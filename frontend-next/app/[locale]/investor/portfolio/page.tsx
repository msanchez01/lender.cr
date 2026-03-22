'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Briefcase, DollarSign, TrendingUp, Users, FileText, Loader2 } from 'lucide-react'
import { investorApi } from '@/lib/api-client'
import type { PortfolioSummary, InvestorInterestWithDeal } from '@/lib/types'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)

const statusColors: Record<string, string> = {
  expressed: 'bg-blue-100 text-blue-700',
  reviewing: 'bg-yellow-100 text-yellow-700',
  committed: 'bg-green-100 text-green-700',
  withdrawn: 'bg-gray-100 text-gray-600',
  declined: 'bg-red-100 text-red-700',
}

export default function PortfolioPage() {
  const t = useTranslations('PortfolioPage')

  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null)
  const [interests, setInterests] = useState<InvestorInterestWithDeal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [p, i] = await Promise.all([
          investorApi.getPortfolio(),
          investorApi.listInterests(),
        ])
        setPortfolio(p)
        setInterests(i)
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

  const summaryCards = [
    { label: t('totalInvested'), value: formatCurrency(summary.total_invested), icon: DollarSign, color: 'text-gold-600' },
    { label: t('activeDeals'), value: String(summary.active_deals_count), icon: TrendingUp, color: 'text-primary-600' },
    { label: t('interestsExpressed'), value: String(summary.interests_expressed), icon: Users, color: 'text-blue-600' },
    { label: t('committed'), value: String(summary.interests_committed), icon: FileText, color: 'text-success-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('pageTitle')}</h1>
      <p className="text-gray-500 mb-6">{t('pageDescription')}</p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Interests list */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('yourInterests')}</h2>

      {interests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{t('noInterests')}</p>
          <Link
            href="/investor/marketplace"
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            {t('browseMarketplace')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {interests.map((interest) => (
            <div
              key={interest.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    #{interest.application_number || '-'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {interest.property_type && (
                      <span className="capitalize">{interest.property_type}</span>
                    )}
                    {interest.property_city && (
                      <span> - {interest.property_city}</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {interest.amount_requested != null && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{t('requested')}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(interest.amount_requested)}
                    </p>
                  </div>
                )}
                {interest.amount_willing != null && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{t('yourOffer')}</p>
                    <p className="text-sm font-medium text-gold-600">
                      {formatCurrency(interest.amount_willing)}
                    </p>
                  </div>
                )}
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                    statusColors[interest.status] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {interest.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
