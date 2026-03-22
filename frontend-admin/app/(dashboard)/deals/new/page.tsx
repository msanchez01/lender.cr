'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useDeals } from '@/hooks/useDeals'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

interface Application {
  id: string
  application_number: string
  borrower_name: string
  loan_amount_usd: number
  loan_term_months: number
}

interface Interest {
  id: string
  investor_name: string
  amount_willing_usd: number
  proposed_rate: number
}

export default function AdminCreateDealPage() {
  const router = useRouter()
  const { createDeal } = useDeals()

  const [applications, setApplications] = useState<Application[]>([])
  const [interests, setInterests] = useState<Interest[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [selectedAppId, setSelectedAppId] = useState('')
  const [selectedInterestId, setSelectedInterestId] = useState('')
  const [form, setForm] = useState({
    interest_rate_monthly: 1.5,
    investor_rate_monthly: 1.0,
    origination_fee_pct: 4.5,
    document_fee: 500,
    servicing_fee_pct: 0.5,
    start_date: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const [appRes, intRes] = await Promise.all([
          api.get('/admin/applications?status=APPROVED'),
          api.get('/admin/interests?status=committed'),
        ])
        setApplications(appRes.data.items || appRes.data)
        setInterests(intRes.data.items || intRes.data)
      } catch {
        setError('Failed to load applications or interests.')
      } finally {
        setLoadingData(false)
      }
    }
    load()
  }, [])

  const selectedApp = useMemo(
    () => applications.find((a) => a.id === selectedAppId) || null,
    [applications, selectedAppId]
  )

  const selectedInterest = useMemo(
    () => interests.find((i) => i.id === selectedInterestId) || null,
    [interests, selectedInterestId]
  )

  // Preview calculations
  const principal = selectedApp?.loan_amount_usd || 0
  const termMonths = selectedApp?.loan_term_months || 12
  const monthlyRate = form.interest_rate_monthly / 100

  const monthlyPayment = useMemo(() => {
    if (!principal || !monthlyRate) return 0
    // Standard amortization formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const factor = Math.pow(1 + monthlyRate, termMonths)
    return principal * (monthlyRate * factor) / (factor - 1)
  }, [principal, monthlyRate, termMonths])

  const originationFeeAmount = (principal * form.origination_fee_pct) / 100

  const maturityDate = useMemo(() => {
    if (!form.start_date) return ''
    const d = new Date(form.start_date)
    d.setMonth(d.getMonth() + termMonths)
    return d.toISOString().split('T')[0]
  }, [form.start_date, termMonths])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedAppId || !selectedInterestId) {
      setError('Please select both an application and an investor interest.')
      return
    }
    setSubmitting(true)
    setError('')

    const dealData = {
      application_id: selectedAppId,
      investor_interest_id: selectedInterestId,
      interest_rate_monthly: form.interest_rate_monthly,
      investor_rate_monthly: form.investor_rate_monthly,
      origination_fee_pct: form.origination_fee_pct,
      document_fee: form.document_fee,
      servicing_fee_pct: form.servicing_fee_pct,
      start_date: form.start_date || undefined,
    }

    const deal = await createDeal(dealData)
    if (deal) {
      router.push(`/deals/${deal.id}`)
    } else {
      setError('Failed to create deal. Please check the data and try again.')
      setSubmitting(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/deals')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create Deal</h1>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Application Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Select Application</h2>
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">-- Select an approved application --</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                #{app.application_number} - {app.borrower_name} - {fmt.format(app.loan_amount_usd)}
              </option>
            ))}
          </select>
        </div>

        {/* Interest Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Select Investor Interest</h2>
          <select
            value={selectedInterestId}
            onChange={(e) => setSelectedInterestId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">-- Select a committed interest --</option>
            {interests.map((interest) => (
              <option key={interest.id} value={interest.id}>
                {interest.investor_name} - {fmt.format(interest.amount_willing_usd)} @ {interest.proposed_rate}%
              </option>
            ))}
          </select>
        </div>

        {/* Deal Terms */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Deal Terms</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Borrower Rate (% monthly)</label>
              <input
                type="number"
                step="0.01"
                value={form.interest_rate_monthly}
                onChange={(e) => setForm({ ...form, interest_rate_monthly: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Investor Rate (% monthly)</label>
              <input
                type="number"
                step="0.01"
                value={form.investor_rate_monthly}
                onChange={(e) => setForm({ ...form, investor_rate_monthly: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Origination Fee (%)</label>
              <input
                type="number"
                step="0.1"
                value={form.origination_fee_pct}
                onChange={(e) => setForm({ ...form, origination_fee_pct: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Document Fee ($)</label>
              <input
                type="number"
                step="1"
                value={form.document_fee}
                onChange={(e) => setForm({ ...form, document_fee: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Servicing Fee (%)</label>
              <input
                type="number"
                step="0.01"
                value={form.servicing_fee_pct}
                onChange={(e) => setForm({ ...form, servicing_fee_pct: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        {selectedApp && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Deal Preview</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Principal</p>
                <p className="font-medium text-gray-900">{fmt.format(principal)}</p>
              </div>
              <div>
                <p className="text-gray-500">Term</p>
                <p className="font-medium text-gray-900">{termMonths} months</p>
              </div>
              <div>
                <p className="text-gray-500">Est. Monthly Payment</p>
                <p className="font-medium text-gray-900">{fmt.format(Math.round(monthlyPayment))}</p>
              </div>
              <div>
                <p className="text-gray-500">Origination Fee</p>
                <p className="font-medium text-gray-900">{fmt.format(originationFeeAmount)}</p>
              </div>
              {maturityDate && (
                <div>
                  <p className="text-gray-500">Maturity Date</p>
                  <p className="font-medium text-gray-900">{new Date(maturityDate).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Platform Spread</p>
                <p className="font-medium text-gray-900">
                  {(form.interest_rate_monthly - form.investor_rate_monthly).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting || !selectedAppId || !selectedInterestId}
            className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating...' : 'Create Deal'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/deals')}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
