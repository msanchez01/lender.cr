'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PROVINCES, getCantons, getDistricts } from '@/lib/data/costa-rica-locations'

interface Props {
  province: string
  canton: string
  district: string
  onProvinceChange: (value: string) => void
  onCantonChange: (value: string) => void
  onDistrictChange: (value: string) => void
  className?: string
}

export default function LocationSelector({
  province,
  canton,
  district,
  onProvinceChange,
  onCantonChange,
  onDistrictChange,
  className = '',
}: Props) {
  const t = useTranslations('PropertiesPage')

  const cantons = province ? getCantons(province) : []
  const districts = province && canton ? getDistricts(province, canton) : []

  // Reset canton/district when province changes
  useEffect(() => {
    if (province && canton) {
      const valid = cantons.some((c) => c.name === canton)
      if (!valid) {
        onCantonChange('')
        onDistrictChange('')
      }
    }
  }, [province]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset district when canton changes
  useEffect(() => {
    if (canton && district) {
      const valid = districts.some((d) => d.name === district)
      if (!valid) {
        onDistrictChange('')
      }
    }
  }, [canton]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectClass =
    'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white'

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('provinceLabel')}
        </label>
        <select
          value={province}
          onChange={(e) => onProvinceChange(e.target.value)}
          className={selectClass}
        >
          <option value="">— {t('selectProvince')} —</option>
          {PROVINCES.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('cantonLabel')}
        </label>
        <select
          value={canton}
          onChange={(e) => onCantonChange(e.target.value)}
          disabled={!province}
          className={selectClass}
        >
          <option value="">— {t('selectCanton')} —</option>
          {cantons.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('districtLabel')}
        </label>
        <select
          value={district}
          onChange={(e) => onDistrictChange(e.target.value)}
          disabled={!canton}
          className={selectClass}
        >
          <option value="">— {t('selectDistrict')} —</option>
          {districts.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
