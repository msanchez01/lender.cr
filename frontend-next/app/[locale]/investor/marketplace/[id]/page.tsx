'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Ruler,
  DollarSign,
  Clock,
  Target,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { investorApi } from '@/lib/api-client'
import type { MarketplaceDeal } from '@/lib/types'
import InterestForm from '@/components/investor/InterestForm'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)

export default function DealDetailPage() {
  const params = useParams()
  const dealId = params.id as string
  const t = useTranslations('MarketplacePage')

  const [deal, setDeal] = useState<MarketplaceDeal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchDeal = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await investorApi.getDeal(dealId)
      setDeal(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [dealId])

  useEffect(() => {
    fetchDeal()
  }, [fetchDeal])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  if (error || !deal) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">{t('dealNotFound')}</p>
        <Link
          href="/investor/marketplace"
          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          {t('backToMarketplace')}
        </Link>
      </div>
    )
  }

  const property = deal.property
  const ltv = deal.final_ltv ?? deal.preliminary_ltv
  const images = property.image_urls

  return (
    <div>
      {/* Back link */}
      <Link
        href="/investor/marketplace"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('backToMarketplace')}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {property.property_type} - {[property.city, property.province].filter(Boolean).join(', ') || t('unknownLocation')}
          </h1>
          <p className="text-sm text-gray-500">#{deal.application_number}</p>
        </div>
        <span className="text-2xl font-bold text-gold-600">
          {formatCurrency(deal.amount_requested)}
        </span>
      </div>

      {/* Property images */}
      {images.length > 0 ? (
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-3" style={{ minWidth: 'min-content' }}>
            {images.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`${property.property_type} ${idx + 1}`}
                className="h-56 w-80 object-cover rounded-xl flex-shrink-0"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 rounded-xl h-56 flex items-center justify-center mb-6">
          <Building2 className="h-16 w-16 text-gray-300" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Property info + Loan terms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('propertyInfo')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">{t('type')}</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{property.property_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">{t('location')}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {[property.city, property.province].filter(Boolean).join(', ') || '-'}
                  </p>
                </div>
              </div>
              {property.estimated_value_usd != null && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">{t('estimatedValue')}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(property.estimated_value_usd)}
                    </p>
                  </div>
                </div>
              )}
              {property.appraised_value_usd != null && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">{t('appraisedValue')}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(property.appraised_value_usd)}
                    </p>
                  </div>
                </div>
              )}
              {property.lot_size_sqm != null && (
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">{t('lotSize')}</p>
                    <p className="text-sm font-medium text-gray-900">{property.lot_size_sqm} m&sup2;</p>
                  </div>
                </div>
              )}
              {property.built_area_sqm != null && (
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">{t('builtArea')}</p>
                    <p className="text-sm font-medium text-gray-900">{property.built_area_sqm} m&sup2;</p>
                  </div>
                </div>
              )}
              {property.year_built != null && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">{t('yearBuilt')}</p>
                    <p className="text-sm font-medium text-gray-900">{property.year_built}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Loan terms */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('loanTerms')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gold-500" />
                <div>
                  <p className="text-xs text-gray-500">{t('amountRequested')}</p>
                  <p className="text-sm font-bold text-gold-600">{formatCurrency(deal.amount_requested)}</p>
                </div>
              </div>
              {ltv != null && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">LTV</p>
                    <p className="text-sm font-medium text-gray-900">{ltv.toFixed(1)}%</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">{t('term')}</p>
                  <p className="text-sm font-medium text-gray-900">{deal.preferred_term_months} {t('months')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">{t('purpose')}</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{deal.purpose}</p>
                </div>
              </div>
            </div>
            {deal.purpose_description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">{t('description')}</p>
                <p className="text-sm text-gray-700">{deal.purpose_description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Interest form or status */}
        <div>
          {deal.my_interest == null ? (
            <InterestForm dealId={deal.id} onSuccess={fetchDeal} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-success-600" />
                <h3 className="text-lg font-semibold text-gray-900">{t('interestExpressed')}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-3">{t('interestExpressedDescription')}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('status')}</span>
                  <span className="font-medium capitalize">{deal.my_interest.status}</span>
                </div>
                {deal.my_interest.amount_willing != null && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('yourAmount')}</span>
                    <span className="font-medium text-gold-600">
                      {formatCurrency(deal.my_interest.amount_willing)}
                    </span>
                  </div>
                )}
                {deal.my_interest.proposed_rate_monthly != null && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('yourRate')}</span>
                    <span className="font-medium">{deal.my_interest.proposed_rate_monthly}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
