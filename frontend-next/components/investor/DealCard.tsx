'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Building2, Users, ArrowRight } from 'lucide-react'
import type { MarketplaceDeal } from '@/lib/types'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)

interface DealCardProps {
  deal: MarketplaceDeal
}

export default function DealCard({ deal }: DealCardProps) {
  const t = useTranslations('MarketplacePage')
  const property = deal.property
  const ltv = deal.final_ltv ?? deal.preliminary_ltv
  const primaryImage = property.image_urls.length > 0 ? property.image_urls[0] : null

  return (
    <Link
      href={`/investor/marketplace/${deal.id}`}
      className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
    >
      {/* Image */}
      <div className="relative h-40 bg-gray-100">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={property.property_type}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Building2 className="h-12 w-12 text-gray-300" />
          </div>
        )}
        {/* Property type badge */}
        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
          {property.property_type}
        </span>
        {/* Interest count */}
        {deal.interest_count > 0 && (
          <span className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <Users className="h-3 w-3" />
            {deal.interest_count}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        <p className="text-sm text-gray-500 mb-1">
          {[property.city, property.province].filter(Boolean).join(', ') || t('unknownLocation')}
        </p>

        {/* Amount */}
        <p className="text-lg font-bold text-gold-600 mb-2">
          {formatCurrency(deal.amount_requested)}
        </p>

        {/* Details row */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {ltv != null && (
            <span className="bg-gray-100 px-2 py-0.5 rounded">
              LTV {Number(ltv).toFixed(1)}%
            </span>
          )}
          <span className="bg-gray-100 px-2 py-0.5 rounded">
            {deal.preferred_term_months} {t('months')}
          </span>
          <span className="bg-gray-100 px-2 py-0.5 rounded capitalize">
            {deal.purpose}
          </span>
        </div>

        {/* CTA */}
        <div className="mt-3 flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700">
          {t('viewDetails')}
          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
