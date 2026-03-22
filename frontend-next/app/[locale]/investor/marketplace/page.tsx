'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Store, Loader2, Search } from 'lucide-react'
import { investorApi } from '@/lib/api-client'
import type { MarketplaceDeal } from '@/lib/types'
import DealCard from '@/components/investor/DealCard'

export default function MarketplacePage() {
  const t = useTranslations('MarketplacePage')

  const [deals, setDeals] = useState<MarketplaceDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  // Filters
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [maxLtv, setMaxLtv] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [province, setProvince] = useState('')

  const fetchDeals = useCallback(async () => {
    setLoading(true)
    try {
      const filters: Record<string, string | number> = {}
      if (minAmount) filters.min_amount = minAmount
      if (maxAmount) filters.max_amount = maxAmount
      if (maxLtv) filters.max_ltv = maxLtv
      if (propertyType) filters.property_type = propertyType
      if (province) filters.province = province

      const result = await investorApi.listDeals(filters)
      setDeals(result.items)
      setTotal(result.total)
    } catch {
      // silently fail, show empty state
      setDeals([])
    } finally {
      setLoading(false)
    }
  }, [minAmount, maxAmount, maxLtv, propertyType, province])

  useEffect(() => {
    fetchDeals()
  }, [fetchDeals])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('pageTitle')}</h1>
      <p className="text-gray-500 mb-6">{t('pageDescription')}</p>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">{t('filters')}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('minAmount')}</label>
            <input
              type="number"
              min="0"
              step="10000"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('maxAmount')}</label>
            <input
              type="number"
              min="0"
              step="10000"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="1000000"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('maxLtv')}</label>
            <input
              type="number"
              min="0"
              max="100"
              step="5"
              value={maxLtv}
              onChange={(e) => setMaxLtv(e.target.value)}
              placeholder="70"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('propertyType')}</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="">{t('allTypes')}</option>
              <option value="house">{t('typeHouse')}</option>
              <option value="apartment">{t('typeApartment')}</option>
              <option value="land">{t('typeLand')}</option>
              <option value="commercial">{t('typeCommercial')}</option>
              <option value="farm">{t('typeFarm')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('province')}</label>
            <input
              type="text"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder={t('provincePlaceholder')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
        </div>
      ) : deals.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Store className="h-10 w-10 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t('noDeals')}</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {t('showingDeals', { count: deals.length, total })}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
