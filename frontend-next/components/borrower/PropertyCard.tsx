'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Home, Image, FileText } from 'lucide-react'
import type { PropertyListItem } from '@/lib/types'

interface PropertyCardProps {
  property: PropertyListItem
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const t = useTranslations('PropertiesPage')

  const formatCurrency = (value: number | null) => {
    if (value === null) return '—'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Link
      href={`/borrower/properties/${property.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-primary-600" />
          <span className="inline-block px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
            {t(`propertyTypes.${property.property_type}`)}
          </span>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
        {property.address}
      </h3>

      {(property.city || property.province) && (
        <p className="text-xs text-gray-500 mb-3">
          {[property.city, property.province].filter(Boolean).join(', ')}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">{t('estimatedValue')}</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(property.estimated_value_usd)}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Image className="h-3.5 w-3.5" />
            {property.image_count}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {property.document_count}
          </span>
        </div>
      </div>
    </Link>
  )
}
