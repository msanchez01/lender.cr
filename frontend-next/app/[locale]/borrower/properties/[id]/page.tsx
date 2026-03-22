'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { useParams } from 'next/navigation'
import { ArrowLeft, Home, Loader2, Trash2, FileText as FileTextIcon, MapPin, Ruler, Calendar, Hash } from 'lucide-react'
import { borrowerApi } from '@/lib/api-client'
import ImageUploader from '@/components/borrower/ImageUploader'
import DocumentUploader from '@/components/borrower/DocumentUploader'
import type { Property } from '@/lib/types'

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const t = useTranslations('PropertiesPage')
  const router = useRouter()

  const fetchProperty = useCallback(async () => {
    try {
      const data = await borrowerApi.getProperty(id)
      setProperty(data)
    } catch {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProperty()
  }, [fetchProperty])

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) return
    setDeleting(true)
    try {
      await borrowerApi.deleteProperty(id)
      router.push('/borrower/properties')
    } catch {
      setDeleting(false)
    }
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return '—'
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

  if (!property) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Property not found.</p>
      </div>
    )
  }

  return (
    <div>
      <Link
        href="/borrower/properties"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('title')}
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Home className="h-5 w-5 text-primary-600" />
            <span className="inline-block px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
              {t(`propertyTypes.${property.property_type}`)}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{property.address}</h1>
          {(property.city || property.province) && (
            <p className="text-gray-500 mt-1">
              {[property.city, property.province].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/borrower/apply?property=${property.id}`}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {t('applyForLoan')}
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {t('deleteProperty')}
          </button>
        </div>
      </div>

      {/* Property Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{t('estimatedValueLabel')}</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(property.estimated_value_usd)}
            </p>
          </div>
          {property.existing_liens_usd !== null && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">{t('existingLiensLabel')}</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(property.existing_liens_usd)}
              </p>
            </div>
          )}
          {property.net_equity_usd !== null && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Net Equity</p>
              <p className="text-sm font-semibold text-success-600">
                {formatCurrency(property.net_equity_usd)}
              </p>
            </div>
          )}
          {property.lot_size_sqm !== null && (
            <div className="flex items-start gap-2">
              <Ruler className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">{t('lotSizeLabel')}</p>
                <p className="text-sm font-medium text-gray-900">{property.lot_size_sqm} m&sup2;</p>
              </div>
            </div>
          )}
          {property.built_area_sqm !== null && (
            <div className="flex items-start gap-2">
              <Ruler className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">{t('builtAreaLabel')}</p>
                <p className="text-sm font-medium text-gray-900">{property.built_area_sqm} m&sup2;</p>
              </div>
            </div>
          )}
          {property.year_built !== null && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">{t('yearBuiltLabel')}</p>
                <p className="text-sm font-medium text-gray-900">{property.year_built}</p>
              </div>
            </div>
          )}
          {property.folio_real && (
            <div className="flex items-start gap-2">
              <Hash className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">{t('folioRealLabel')}</p>
                <p className="text-sm font-medium text-gray-900">{property.folio_real}</p>
              </div>
            </div>
          )}
          {property.plano_catastrado && (
            <div className="flex items-start gap-2">
              <Hash className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">{t('planoCatastradoLabel')}</p>
                <p className="text-sm font-medium text-gray-900">{property.plano_catastrado}</p>
              </div>
            </div>
          )}
        </div>

        {property.description && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{t('descriptionLabel')}</p>
            <p className="text-sm text-gray-700">{property.description}</p>
          </div>
        )}
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <ImageUploader
          propertyId={property.id}
          images={property.images}
          onUpload={fetchProperty}
        />
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <DocumentUploader
          propertyId={property.id}
          documents={property.documents}
          onUpload={fetchProperty}
        />
      </div>
    </div>
  )
}
