'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Save, Loader2, CheckCircle, Settings2, Info } from 'lucide-react'
import { useAuth, getAccessToken } from '@/lib/auth'
import api from '@/lib/api-client'

export default function InvestorSettings() {
  const { user, refreshUser } = useAuth()
  const t = useTranslations('SettingsPage')

  // Personal info
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Investment preferences
  const [minInvestment, setMinInvestment] = useState('')
  const [maxInvestment, setMaxInvestment] = useState('')
  const [preferredLtvMax, setPreferredLtvMax] = useState('')
  const [preferredTermMin, setPreferredTermMin] = useState('')
  const [preferredTermMax, setPreferredTermMax] = useState('')
  const [preferredRegions, setPreferredRegions] = useState('')
  const [taxCountry, setTaxCountry] = useState('')
  const [taxId, setTaxId] = useState('')
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [savedPrefs, setSavedPrefs] = useState(false)

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name)
      setLastName(user.last_name)
      setPhone('')
      setWhatsapp('')
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      const token = getAccessToken()
      await api.put('/auth/me', {
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
        whatsapp: whatsapp || undefined,
      }, { headers: { Authorization: `Bearer ${token}` } })
      await refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPrefs(true)
    setSavedPrefs(false)
    try {
      const token = getAccessToken()
      await api.put('/investor/profile', {
        min_investment_usd: minInvestment ? parseFloat(minInvestment) : undefined,
        max_investment_usd: maxInvestment ? parseFloat(maxInvestment) : undefined,
        preferred_ltv_max: preferredLtvMax ? parseFloat(preferredLtvMax) : undefined,
        preferred_term_min_months: preferredTermMin ? parseInt(preferredTermMin) : undefined,
        preferred_term_max_months: preferredTermMax ? parseInt(preferredTermMax) : undefined,
        preferred_regions: preferredRegions || undefined,
        tax_country: taxCountry || undefined,
        tax_id: taxId || undefined,
      }, { headers: { Authorization: `Bearer ${token}` } })
      setSavedPrefs(true)
      setTimeout(() => setSavedPrefs(false), 3000)
    } finally {
      setSavingPrefs(false)
    }
  }

  if (!user) return null

  const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'

  function FieldLabel({ text, tooltip }: { text: string; tooltip?: string }) {
    return (
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
        {text}
        {tooltip && (
          <span className="relative group">
            <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg w-56 text-center opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              {tooltip}
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </span>
          </span>
        )}
      </label>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('pageTitle')}</h1>

      {/* Personal info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('personalInfo')}</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+506 ..." className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+506 ..." className={inputClass} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" />{t('saving')}</> : <><Save className="h-4 w-4" />{t('saveChanges')}</>}
            </button>
            {saved && <span className="flex items-center gap-1 text-sm text-success-600"><CheckCircle className="h-4 w-4" />{t('saved')}</span>}
          </div>
        </form>
      </div>

      {/* Investment preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="h-5 w-5 text-gold-500" />
          <h2 className="text-lg font-semibold text-gray-900">{t('investmentPreferences')}</h2>
        </div>
        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel text={t('minInvestmentUsd')} tooltip={t('minInvestmentTooltip')} />
              <input
                type="number"
                min="0"
                step="1000"
                value={minInvestment}
                onChange={(e) => setMinInvestment(e.target.value)}
                placeholder="10000"
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel text={t('maxInvestmentUsd')} tooltip={t('maxInvestmentTooltip')} />
              <input
                type="number"
                min="0"
                step="1000"
                value={maxInvestment}
                onChange={(e) => setMaxInvestment(e.target.value)}
                placeholder="500000"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <FieldLabel text={t('preferredLtvMax')} tooltip={t('preferredLtvTooltip')} />
            <input
              type="number"
              min="0"
              max="100"
              step="5"
              value={preferredLtvMax}
              onChange={(e) => setPreferredLtvMax(e.target.value)}
              placeholder="70"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel text={t('preferredTermMin')} tooltip={t('preferredTermMinTooltip')} />
              <input
                type="number"
                min="1"
                step="1"
                value={preferredTermMin}
                onChange={(e) => setPreferredTermMin(e.target.value)}
                placeholder="6"
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel text={t('preferredTermMax')} tooltip={t('preferredTermMaxTooltip')} />
              <input
                type="number"
                min="1"
                step="1"
                value={preferredTermMax}
                onChange={(e) => setPreferredTermMax(e.target.value)}
                placeholder="36"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <FieldLabel text={t('preferredRegions')} tooltip={t('preferredRegionsTooltip')} />
            <input
              type="text"
              value={preferredRegions}
              onChange={(e) => setPreferredRegions(e.target.value)}
              placeholder={t('preferredRegionsPlaceholder')}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel text={t('taxCountry')} tooltip={t('taxCountryTooltip')} />
              <select
                value={taxCountry}
                onChange={(e) => setTaxCountry(e.target.value)}
                className={inputClass}
              >
                <option value="">—</option>
                <option value="Costa Rica">Costa Rica</option>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="Mexico">México</option>
                <option value="Panama">Panamá</option>
                <option value="Colombia">Colombia</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Spain">España</option>
                <option value="Switzerland">Switzerland</option>
                <option value="Netherlands">Netherlands</option>
                <option value="Italy">Italy</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <FieldLabel text={t('taxId')} tooltip={t('taxIdTooltip')} />
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="1-0123-0456"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={savingPrefs} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
              {savingPrefs ? <><Loader2 className="h-4 w-4 animate-spin" />{t('saving')}</> : <><Save className="h-4 w-4" />{t('savePreferences')}</>}
            </button>
            {savedPrefs && <span className="flex items-center gap-1 text-sm text-success-600"><CheckCircle className="h-4 w-4" />{t('saved')}</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
