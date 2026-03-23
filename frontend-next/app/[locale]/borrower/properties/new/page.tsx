'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { borrowerApi } from '@/lib/api-client'
import LocationSelector from '@/components/LocationSelector'

const PROPERTY_TYPES = ['house', 'apartment', 'lot', 'commercial', 'farm', 'mixed'] as const

export default function NewPropertyPage() {
  const t = useTranslations('PropertiesPage')
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    property_type: 'house',
    address: '',
    province: '',
    canton: '',
    district: '',
    google_maps_url: '',
    lot_size_sqm: '',
    built_area_sqm: '',
    year_built: '',
    folio_real: '',
    plano_catastrado: '',
    estimated_value_usd: '',
    existing_liens_usd: '',
    description: '',
  })

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.address.trim()) return

    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        property_type: form.property_type,
        address: form.address.trim(),
      }

      if (form.province) payload.province = form.province
      if (form.canton) payload.city = form.canton
      if (form.district) payload.district = form.district
      if (form.google_maps_url.trim()) payload.google_maps_url = form.google_maps_url.trim()
      if (form.lot_size_sqm) payload.lot_size_sqm = parseFloat(form.lot_size_sqm)
      if (form.built_area_sqm) payload.built_area_sqm = parseFloat(form.built_area_sqm)
      if (form.year_built) payload.year_built = parseInt(form.year_built, 10)
      if (form.folio_real.trim()) payload.folio_real = form.folio_real.trim()
      if (form.plano_catastrado.trim()) payload.plano_catastrado = form.plano_catastrado.trim()
      if (form.estimated_value_usd) payload.estimated_value_usd = parseFloat(form.estimated_value_usd)
      if (form.existing_liens_usd) payload.existing_liens_usd = parseFloat(form.existing_liens_usd)
      if (form.description.trim()) payload.description = form.description.trim()

      const created = await borrowerApi.createProperty(payload)
      router.push(`/borrower/properties/${created.id}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div>
      <Link
        href="/borrower/properties"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('title')}
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('addProperty')}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">{t('formTitle')}</h2>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className={labelClass}>{t('typeLabel')}</label>
          <select
            value={form.property_type}
            onChange={(e) => updateField('property_type', e.target.value)}
            className={`${inputClass} bg-white`}
          >
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`propertyTypes.${type}`)}
              </option>
            ))}
          </select>
        </div>

        <LocationSelector
          province={form.province}
          canton={form.canton}
          district={form.district}
          onProvinceChange={(v) => updateField('province', v)}
          onCantonChange={(v) => updateField('canton', v)}
          onDistrictChange={(v) => updateField('district', v)}
        />

        <div>
          <label className={labelClass}>{t('exactAddressLabel')} *</label>
          <textarea
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            required
            rows={2}
            placeholder={t('exactAddressPlaceholder')}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className={labelClass}>{t('googleMapsLabel')}</label>
          <input
            type="url"
            value={form.google_maps_url}
            onChange={(e) => updateField('google_maps_url', e.target.value)}
            placeholder={t('googleMapsPlaceholder')}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>{t('lotSizeLabel')}</label>
            <input
              type="number"
              step="0.01"
              value={form.lot_size_sqm}
              onChange={(e) => updateField('lot_size_sqm', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t('builtAreaLabel')}</label>
            <input
              type="number"
              step="0.01"
              value={form.built_area_sqm}
              onChange={(e) => updateField('built_area_sqm', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t('yearBuiltLabel')}</label>
            <input
              type="number"
              value={form.year_built}
              onChange={(e) => updateField('year_built', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t('folioRealLabel')}</label>
            <input
              type="text"
              value={form.folio_real}
              onChange={(e) => updateField('folio_real', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t('planoCatastradoLabel')}</label>
            <input
              type="text"
              value={form.plano_catastrado}
              onChange={(e) => updateField('plano_catastrado', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t('estimatedValueLabel')}</label>
            <input
              type="number"
              step="0.01"
              value={form.estimated_value_usd}
              onChange={(e) => updateField('estimated_value_usd', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t('existingLiensLabel')}</label>
            <input
              type="number"
              step="0.01"
              value={form.existing_liens_usd}
              onChange={(e) => updateField('existing_liens_usd', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>{t('descriptionLabel')}</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('saving')}
              </>
            ) : (
              t('saveProperty')
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
