'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { investorApi } from '@/lib/api-client'

interface InterestFormProps {
  dealId: string
  onSuccess: () => void
}

export default function InterestForm({ dealId, onSuccess }: InterestFormProps) {
  const t = useTranslations('MarketplacePage')

  const [amountWilling, setAmountWilling] = useState('')
  const [proposedRate, setProposedRate] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      await investorApi.expressInterest(dealId, {
        amount_willing: amountWilling ? parseFloat(amountWilling) : undefined,
        proposed_rate_monthly: proposedRate ? parseFloat(proposedRate) : undefined,
        message: message || undefined,
      })
      setSuccess(true)
      onSuccess()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined
      setError(msg || t('interestError'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-success-50 border border-success-200 rounded-xl p-6 text-center">
        <CheckCircle className="h-8 w-8 text-success-600 mx-auto mb-2" />
        <p className="text-success-700 font-medium">{t('interestSuccess')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('expressInterest')}</h3>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('amountWilling')} (USD)
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={amountWilling}
            onChange={(e) => setAmountWilling(e.target.value)}
            placeholder="50000"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('proposedRate')} (% {t('monthly')})
          </label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={proposedRate}
            onChange={(e) => setProposedRate(e.target.value)}
            placeholder="1.5"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('message')}
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('messagePlaceholder')}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 disabled:bg-gold-300 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('submitting')}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {t('submitInterest')}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
