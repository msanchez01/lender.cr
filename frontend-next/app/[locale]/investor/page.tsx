'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  DollarSign,
  TrendingUp,
  Users,
  ArrowRight,
  Store,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
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

export default function InvestorDashboard() {
  const { user } = useAuth()
  const t = useTranslations('InvestorDashboard')
  const tp = useTranslations('PortfolioPage')

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

  if (!user) return null

  const summary = portfolio || {
    total_invested: 0,
    active_deals_count: 0,
    interests_expressed: 0,
    interests_committed: 0,
    total_interest_earned: 0,
    avg_annual_return: 0,
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {t('welcomeTitle', { name: user.first_name })}
      </h1>
      <p className="text-gray-500 mb-8">{t('welcomeDescription')}</p>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-gold-600" />
                <span className="text-xs text-gray-500">{tp('totalInvested')}</span>
              </div>
              <p className="text-xl font-bold text-gold-600">{formatCurrency(summary.total_invested)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary-600" />
                <span className="text-xs text-gray-500">{tp('activeDeals')}</span>
              </div>
              <p className="text-xl font-bold text-primary-600">{summary.active_deals_count}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-gray-500">{tp('interestsExpressed')}</span>
              </div>
              <p className="text-xl font-bold text-blue-600">{summary.interests_expressed}</p>
            </div>
          </div>

          {/* Recent interests */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('recentInterests')}</h2>
              {interests.length > 0 && (
                <Link
                  href="/investor/portfolio"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  {t('viewAll')}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {interests.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <Store className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">{t('noInvestments')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {interests.slice(0, 3).map((interest) => (
                  <div
                    key={interest.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        #{interest.application_number || '-'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {interest.property_type && (
                          <span className="capitalize">{interest.property_type}</span>
                        )}
                        {interest.property_city && <span> - {interest.property_city}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {interest.amount_willing != null && (
                        <span className="text-sm font-medium text-gold-600">
                          {formatCurrency(interest.amount_willing)}
                        </span>
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

          {/* Quick actions */}
          <div>
            <Link
              href="/investor/marketplace"
              className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              {t('browseDeals')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
