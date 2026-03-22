'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Plus, Home, Loader2 } from 'lucide-react'
import { borrowerApi } from '@/lib/api-client'
import PropertyCard from '@/components/borrower/PropertyCard'
import type { PropertyListItem } from '@/lib/types'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyListItem[]>([])
  const [loading, setLoading] = useState(true)
  const t = useTranslations('PropertiesPage')

  useEffect(() => {
    async function fetch() {
      try {
        const data = await borrowerApi.listProperties()
        setProperties(data.items)
      } catch {
        // Error handled silently
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <Link
          href="/borrower/properties/new"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t('addProperty')}
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Home className="h-10 w-10 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-1">{t('noProperties')}</p>
          <p className="text-sm text-gray-400">{t('addFirst')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}
