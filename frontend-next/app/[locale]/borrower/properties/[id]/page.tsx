'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { useParams } from 'next/navigation'
import { ArrowLeft, Home, Loader2, Trash2, Pencil, X, Save, Ruler, Calendar, Hash, MapPin, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'
import { borrowerApi } from '@/lib/api-client'
import ImageUploader from '@/components/borrower/ImageUploader'
import DocumentUploader from '@/components/borrower/DocumentUploader'
import LocationSelector from '@/components/LocationSelector'
import type { Property } from '@/lib/types'

const PROPERTY_TYPES = ['house', 'apartment', 'lot', 'commercial', 'farm', 'mixed'] as const

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const t = useTranslations('PropertiesPage')
  const router = useRouter()

  // Edit form state
  const [form, setForm] = useState({
    property_type: '',
    address: '',
    province: '',
    city: '',
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

  const startEditing = () => {
    if (!property) return
    setForm({
      property_type: property.property_type,
      address: property.address,
      province: property.province || '',
      city: property.city || '',
      district: property.district || '',
      google_maps_url: property.google_maps_url || '',
      lot_size_sqm: property.lot_size_sqm?.toString() || '',
      built_area_sqm: property.built_area_sqm?.toString() || '',
      year_built: property.year_built?.toString() || '',
      folio_real: property.folio_real || '',
      plano_catastrado: property.plano_catastrado || '',
      estimated_value_usd: property.estimated_value_usd?.toString() || '',
      existing_liens_usd: property.existing_liens_usd?.toString() || '',
      description: property.description || '',
    })
    setEditing(true)
    setSaveError('')
    setSaveSuccess(false)
  }

  const cancelEditing = () => {
    setEditing(false)
    setSaveError('')
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      const payload: Record<string, unknown> = {
        property_type: form.property_type,
        address: form.address.trim(),
      }
      if (form.province) payload.province = form.province
      if (form.city) payload.city = form.city
      if (form.district) payload.district = form.district
      if (form.google_maps_url.trim()) payload.google_maps_url = form.google_maps_url.trim()
      if (form.lot_size_sqm) payload.lot_size_sqm = parseFloat(form.lot_size_sqm)
      if (form.built_area_sqm) payload.built_area_sqm = parseFloat(form.built_area_sqm)
      if (form.year_built) payload.year_built = parseInt(form.year_built, 10)
      if (form.folio_real.trim()) payload.folio_real = form.folio_real.trim()
      if (form.plano_catastrado.trim()) payload.plano_catastrado = form.plano_catastrado.trim()
      if (form.estimated_value_usd) payload.estimated_value_usd = parseFloat(form.estimated_value_usd)
      if (form.existing_liens_usd) payload.existing_liens_usd = parseFloat(form.existing_liens_usd)
      payload.description = form.description.trim() || null

      await borrowerApi.updateProperty(id, payload)
      await fetchProperty()
      setEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      setSaveError(axiosErr.response?.data?.detail || 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

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
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>
  }

  if (!property) {
    return <div className="text-center py-20"><p className="text-gray-500">Property not found.</p></div>
  }

  const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div>
      <Link href="/borrower/properties" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4">
        <ArrowLeft className="h-4 w-4" /> {t('title')}
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
          {(property.district || property.city || property.province) && (
            <p className="text-gray-500 mt-1">
              {[property.district, property.city, property.province].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!editing && (
            <button
              onClick={startEditing}
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <Pencil className="h-4 w-4" /> {t('editProperty')}
            </button>
          )}
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
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {t('deleteProperty')}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-success-50 border border-success-200 rounded-lg text-sm text-success-700">
          <CheckCircle className="h-4 w-4" /> {t('saved')}
        </div>
      )}

      {/* Property Details — View or Edit mode */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        {editing ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">{t('formTitle')}</h2>
              <button onClick={cancelEditing} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>

            {saveError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" /> {saveError}
              </div>
            )}

            <div>
              <label className={labelClass}>{t('typeLabel')}</label>
              <select value={form.property_type} onChange={(e) => updateField('property_type', e.target.value)} className={`${inputClass} bg-white`}>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>{t(`propertyTypes.${type}`)}</option>
                ))}
              </select>
            </div>

            <LocationSelector
              province={form.province}
              canton={form.city}
              district={form.district}
              onProvinceChange={(v) => updateField('province', v)}
              onCantonChange={(v) => updateField('city', v)}
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
                <input type="number" step="0.01" value={form.lot_size_sqm} onChange={(e) => updateField('lot_size_sqm', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('builtAreaLabel')}</label>
                <input type="number" step="0.01" value={form.built_area_sqm} onChange={(e) => updateField('built_area_sqm', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('yearBuiltLabel')}</label>
                <input type="number" value={form.year_built} onChange={(e) => updateField('year_built', e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('folioRealLabel')}</label>
                <input type="text" value={form.folio_real} onChange={(e) => updateField('folio_real', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('planoCatastradoLabel')}</label>
                <input type="text" value={form.plano_catastrado} onChange={(e) => updateField('plano_catastrado', e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('estimatedValueLabel')}</label>
                <input type="number" step="0.01" value={form.estimated_value_usd} onChange={(e) => updateField('estimated_value_usd', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('existingLiensLabel')}</label>
                <input type="number" step="0.01" value={form.existing_liens_usd} onChange={(e) => updateField('existing_liens_usd', e.target.value)} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>{t('descriptionLabel')}</label>
              <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={3} className={`${inputClass} resize-none`} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={cancelEditing} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.address.trim()}
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
              >
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> {t('saving')}</> : <><Save className="h-4 w-4" /> {t('saveChanges')}</>}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">{t('estimatedValueLabel')}</p>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(property.estimated_value_usd)}</p>
              </div>
              {property.existing_liens_usd !== null && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">{t('existingLiensLabel')}</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(property.existing_liens_usd)}</p>
                </div>
              )}
              {property.net_equity_usd !== null && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Net Equity</p>
                  <p className="text-sm font-semibold text-success-600">{formatCurrency(property.net_equity_usd)}</p>
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
              {property.google_maps_url && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">{t('googleMapsLabel')}</p>
                    <a href={property.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                      Google Maps <ExternalLink className="h-3 w-3" />
                    </a>
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
          </>
        )}
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <ImageUploader propertyId={property.id} images={property.images} onUpload={fetchProperty} />
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <DocumentUploader propertyId={property.id} documents={property.documents} onUpload={fetchProperty} />
      </div>
    </div>
  )
}
