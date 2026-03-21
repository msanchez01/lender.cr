'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Calculator, ArrowRight } from 'lucide-react'
import { calculateLtv, getLtvTier, formatCurrency, MAX_LTV, ORIGINATION_FEE_PERCENT } from '@/lib/utils/ltv'
import { trackCalculatorUsed } from '@/lib/utils/analytics'
import { Link } from '@/i18n/navigation'

const TIER_LABELS: Record<string, string> = {
  excellent: 'tierExcellent',
  good: 'tierGood',
  standard: 'tierStandard',
  not_qualified: 'tierNotQualified',
}

export default function LtvCalculator({ compact = false }: { compact?: boolean }) {
  const [propertyValue, setPropertyValue] = useState('')
  const [loanAmount, setLoanAmount] = useState('')
  const [calculated, setCalculated] = useState(false)
  const t = useTranslations('Calculator')

  const parsedPropertyValue = parseFloat(propertyValue.replace(/[^0-9.]/g, '')) || 0
  const parsedLoanAmount = parseFloat(loanAmount.replace(/[^0-9.]/g, '')) || 0

  const ltv = calculateLtv(parsedPropertyValue, parsedLoanAmount)
  const tier = getLtvTier(ltv)

  const handleCalculate = () => {
    if (parsedPropertyValue > 0 && parsedLoanAmount > 0) {
      setCalculated(true)
      trackCalculatorUsed(parsedPropertyValue, parsedLoanAmount)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCalculate()
  }

  return (
    <div className={compact ? '' : 'max-w-2xl mx-auto'}>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('propertyValueLabel')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={propertyValue}
                onChange={(e) => {
                  setPropertyValue(e.target.value)
                  setCalculated(false)
                }}
                onKeyDown={handleKeyDown}
                placeholder={t('propertyValuePlaceholder')}
                className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('loanAmountLabel')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={loanAmount}
                onChange={(e) => {
                  setLoanAmount(e.target.value)
                  setCalculated(false)
                }}
                onKeyDown={handleKeyDown}
                placeholder={t('loanAmountPlaceholder')}
                className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={parsedPropertyValue <= 0 || parsedLoanAmount <= 0}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          <Calculator className="h-4 w-4" />
          {t('calculateButton')}
        </button>

        {calculated && (
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">{t('ltvRatio')}</p>
              <p className="text-4xl font-bold text-gray-900">{ltv.toFixed(1)}%</p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <span className="text-sm text-gray-500">{t('qualificationLabel')}:</span>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${tier.bgColor} ${tier.color}`}>
                {t(TIER_LABELS[tier.tier])}
              </span>
            </div>

            {tier.tier !== 'not_qualified' && (
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{t('estimatedRate')}</p>
                  <p className="text-lg font-semibold text-gray-900">{tier.rateMin}-{tier.rateMax}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{t('originationFee')}</p>
                  <p className="text-lg font-semibold text-gray-900">{ORIGINATION_FEE_PERCENT}%</p>
                  <p className="text-xs text-gray-400">{formatCurrency(parsedLoanAmount * ORIGINATION_FEE_PERCENT / 100)}</p>
                </div>
              </div>
            )}

            {!compact && tier.tier !== 'not_qualified' && (
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
                >
                  {t('ctaButton')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            <p className="text-xs text-gray-400 text-center">{t('disclaimer')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
