'use client'

import { useState, useEffect, Suspense } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Loader2, Check, Home, DollarSign, ClipboardCheck } from 'lucide-react'
import { borrowerApi } from '@/lib/api-client'
import type { PropertyListItem } from '@/lib/types'

const TERM_OPTIONS = [6, 12, 18, 24, 36]
const PURPOSE_OPTIONS = [
  'property_purchase',
  'bridge_financing',
  'construction',
  'business_capital',
  'debt_consolidation',
  'renovation',
  'other',
] as const

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto py-12 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto" /></div>}>
      <ApplyForm />
    </Suspense>
  )
}

function ApplyForm() {
  const t = useTranslations('ApplicationsPage')
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedPropertyId = searchParams.get('property')

  const [step, setStep] = useState(1)
  const [properties, setProperties] = useState<PropertyListItem[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [selectedPropertyId, setSelectedPropertyId] = useState(preselectedPropertyId || '')
  const [amountRequested, setAmountRequested] = useState('')
  const [preferredTerm, setPreferredTerm] = useState('12')
  const [purpose, setPurpose] = useState<string>(PURPOSE_OPTIONS[0])
  const [purposeDescription, setPurposeDescription] = useState('')
  const [maxRate, setMaxRate] = useState('')

  useEffect(() => {
    async function fetch() {
      try {
        const data = await borrowerApi.listProperties()
        setProperties(data.items)
      } catch {
        // Error handled silently
      } finally {
        setLoadingProperties(false)
      }
    }
    fetch()
  }, [])

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId)

  const preliminaryLtv =
    selectedProperty?.estimated_value_usd && amountRequested
      ? (parseFloat(amountRequested) / selectedProperty.estimated_value_usd) * 100
      : null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const canProceedStep1 = !!selectedPropertyId
  const canProceedStep2 = !!amountRequested && parseFloat(amountRequested) > 0

  const handleSubmit = async () => {
    setError('')
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        property_id: selectedPropertyId,
        amount_requested: parseFloat(amountRequested),
        currency: 'USD',
        preferred_term_months: parseInt(preferredTerm, 10),
        purpose,
      }
      if (purposeDescription.trim()) payload.purpose_description = purposeDescription.trim()
      if (maxRate) payload.max_interest_rate_monthly = parseFloat(maxRate)

      const created = await borrowerApi.createApplication(payload)
      await borrowerApi.updateApplication(created.id, { status: 'submitted' })
      router.push(`/borrower/applications/${created.id}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  const steps = [
    { num: 1, label: 'Property', icon: Home },
    { num: 2, label: 'Loan Details', icon: DollarSign },
    { num: 3, label: 'Review', icon: ClipboardCheck },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('applyTitle')}</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map(({ num, label, icon: Icon }) => (
          <div key={num} className="flex items-center gap-2">
            {num > 1 && <div className={`w-8 h-px ${step >= num ? 'bg-primary-400' : 'bg-gray-200'}`} />}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                step === num
                  ? 'bg-primary-600 text-white'
                  : step > num
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {/* Step 1: Select Property */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('selectProperty')}</h2>

          {loadingProperties ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              No properties found. Please add a property first.
            </div>
          ) : (
            <div className="space-y-2">
              {properties.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => setSelectedPropertyId(prop.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedPropertyId === prop.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{prop.address}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {[prop.city, prop.province].filter(Boolean).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {prop.estimated_value_usd
                          ? formatCurrency(prop.estimated_value_usd)
                          : '—'}
                      </p>
                      <p className="text-xs text-gray-500">{prop.property_type}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Loan Details */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h2>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>{t('amountLabel')}</label>
              <input
                type="number"
                step="100"
                min="1"
                value={amountRequested}
                onChange={(e) => setAmountRequested(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>{t('termLabel')}</label>
              <select
                value={preferredTerm}
                onChange={(e) => setPreferredTerm(e.target.value)}
                className={`${inputClass} bg-white`}
              >
                {TERM_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m} {t('months')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>{t('purposeLabel')}</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className={`${inputClass} bg-white`}
              >
                {PURPOSE_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {t(`purposes.${p}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>{t('purposeDescriptionLabel')}</label>
              <textarea
                value={purposeDescription}
                onChange={(e) => setPurposeDescription(e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className={labelClass}>{t('maxRateLabel')}</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!canProceedStep2}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('reviewTitle')}</h2>

          {/* Property Summary */}
          {selectedProperty && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 mb-4">
              <p className="text-xs text-gray-500 mb-1">{t('selectProperty')}</p>
              <p className="text-sm font-medium text-gray-900">{selectedProperty.address}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {[selectedProperty.city, selectedProperty.province].filter(Boolean).join(', ')}
              </p>
              {selectedProperty.estimated_value_usd && (
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {formatCurrency(selectedProperty.estimated_value_usd)}
                </p>
              )}
            </div>
          )}

          {/* Loan Details Summary */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">{t('amount')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {amountRequested ? formatCurrency(parseFloat(amountRequested)) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">{t('term')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {preferredTerm} {t('months')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">{t('purpose')}</p>
              <p className="text-sm font-medium text-gray-900">{t(`purposes.${purpose}`)}</p>
            </div>
            {preliminaryLtv !== null && (
              <div>
                <p className="text-xs text-gray-500 mb-0.5">{t('preliminaryLtv')}</p>
                <p
                  className={`text-lg font-semibold ${
                    preliminaryLtv <= 50 ? 'text-success-600' : 'text-red-600'
                  }`}
                >
                  {preliminaryLtv.toFixed(1)}%
                </p>
              </div>
            )}
          </div>

          {maxRate && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-0.5">{t('maxRateLabel')}</p>
              <p className="text-sm font-medium text-gray-900">{maxRate}%</p>
            </div>
          )}

          {purposeDescription.trim() && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-0.5">{t('purposeDescriptionLabel')}</p>
              <p className="text-sm text-gray-700">{purposeDescription}</p>
            </div>
          )}

          <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('submitting')}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  {t('submitApplication')}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
