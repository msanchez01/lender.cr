'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, Check } from 'lucide-react'
import { useDeals, Deal, Payment } from '@/hooks/useDeals'
import StatusBadge from '@/components/admin/StatusBadge'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''

const dealStatuses = ['pending_legal', 'active', 'current', 'late', 'default', 'paid_off']

export default function AdminDealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { fetchDeal, updateDeal, fetchPayments, updatePayment } = useDeals()

  const id = params.id as string

  const [deal, setDeal] = useState<Deal | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusValue, setStatusValue] = useState('')

  // Mark paid inline form
  const [payingId, setPayingId] = useState<string | null>(null)
  const [payForm, setPayForm] = useState({
    amount_paid: 0,
    paid_date: '',
    payment_method: '',
    payment_reference: '',
  })

  async function load() {
    setLoading(true)
    const [d, p] = await Promise.all([fetchDeal(id), fetchPayments(id)])
    if (d) {
      setDeal(d)
      setStatusValue(d.status)
    }
    setPayments(p)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleStatusUpdate() {
    if (!deal || statusValue === deal.status) return
    setSaving(true)
    const ok = await updateDeal(id, { status: statusValue })
    if (ok) await load()
    setSaving(false)
  }

  function openPayForm(payment: Payment) {
    setPayingId(payment.id)
    setPayForm({
      amount_paid: payment.amount_due,
      paid_date: new Date().toISOString().split('T')[0],
      payment_method: '',
      payment_reference: '',
    })
  }

  async function handleMarkPaid() {
    if (!payingId) return
    setSaving(true)
    const ok = await updatePayment(payingId, {
      status: 'paid',
      amount_paid: payForm.amount_paid,
      paid_date: payForm.paid_date,
      payment_method: payForm.payment_method || undefined,
      payment_reference: payForm.payment_reference || undefined,
    })
    if (ok) {
      setPayingId(null)
      await load()
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading deal...</div>
  }

  if (!deal) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Deal not found.</div>
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/deals')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Deal {deal.deal_number}</h1>
        <StatusBadge status={deal.status} type="deal" />
      </div>

      {/* Deal Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Deal Info</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Principal</p>
            <p className="font-medium text-gray-900">{fmt.format(deal.principal_amount)}</p>
          </div>
          <div>
            <p className="text-gray-500">Borrower Rate</p>
            <p className="font-medium text-gray-900">{deal.interest_rate_monthly}% monthly</p>
          </div>
          <div>
            <p className="text-gray-500">Investor Rate</p>
            <p className="font-medium text-gray-900">{deal.investor_rate_monthly}% monthly</p>
          </div>
          <div>
            <p className="text-gray-500">Platform Spread</p>
            <p className="font-medium text-gray-900">{deal.platform_spread}%</p>
          </div>
          <div>
            <p className="text-gray-500">Term</p>
            <p className="font-medium text-gray-900">{deal.term_months} months</p>
          </div>
          <div>
            <p className="text-gray-500">Monthly Payment</p>
            <p className="font-medium text-gray-900">{fmt.format(deal.monthly_payment)}</p>
          </div>
          <div>
            <p className="text-gray-500">Origination Fee</p>
            <p className="font-medium text-gray-900">{deal.origination_fee_pct}% ({fmt.format(deal.origination_fee_amount)})</p>
          </div>
          <div>
            <p className="text-gray-500">Document Fee</p>
            <p className="font-medium text-gray-900">{fmt.format(deal.document_fee)}</p>
          </div>
          <div>
            <p className="text-gray-500">Servicing Fee</p>
            <p className="font-medium text-gray-900">{deal.servicing_fee_pct}%</p>
          </div>
          <div>
            <p className="text-gray-500">Start Date</p>
            <p className="font-medium text-gray-900">
              {deal.start_date ? new Date(deal.start_date).toLocaleDateString() : '-'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Maturity Date</p>
            <p className="font-medium text-gray-900">
              {deal.maturity_date ? new Date(deal.maturity_date).toLocaleDateString() : '-'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Outstanding</p>
            <p className="font-semibold text-gray-900">{fmt.format(deal.outstanding_principal)}</p>
          </div>
          {deal.ltv_ratio != null && (
            <div>
              <p className="text-gray-500">LTV</p>
              <p className="font-medium text-gray-900">{deal.ltv_ratio}%</p>
            </div>
          )}
          {deal.notary_date && (
            <div>
              <p className="text-gray-500">Notary Date</p>
              <p className="font-medium text-gray-900">{new Date(deal.notary_date).toLocaleDateString()}</p>
            </div>
          )}
          {deal.disbursement_date && (
            <div>
              <p className="text-gray-500">Disbursement Date</p>
              <p className="font-medium text-gray-900">{new Date(deal.disbursement_date).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Borrower & Investor Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Borrower</h2>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{deal.borrower_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{deal.borrower_email}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Investor</h2>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{deal.investor_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{deal.investor_email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Update Status</h2>
        <div className="flex items-center gap-3">
          <select
            value={statusValue}
            onChange={(e) => setStatusValue(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {dealStatuses.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
          <button
            onClick={handleStatusUpdate}
            disabled={saving || statusValue === deal.status}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            Update
          </button>
        </div>
      </div>

      {/* PDF Downloads */}
      <div className="flex flex-wrap gap-3">
        <a
          href={`${API_URL}/api/v1/admin/deals/${id}/agreement`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          style={API_KEY ? {} : undefined}
        >
          <Download className="h-4 w-4" />
          Download Loan Agreement
        </a>
        <a
          href={`${API_URL}/api/v1/admin/deals/${id}/schedule`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 border border-primary-200 text-primary-700 hover:bg-primary-50 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Download className="h-4 w-4" />
          Download Payment Schedule
        </a>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Due Date</th>
                <th className="px-4 py-3 font-medium">Amount Due</th>
                <th className="px-4 py-3 font-medium">Amount Paid</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    No payments found.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{payment.payment_number}</td>
                    <td className="px-4 py-3 text-gray-700">{new Date(payment.due_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{fmt.format(payment.amount_due)}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {payment.amount_paid != null ? fmt.format(payment.amount_paid) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={payment.status} type="payment" />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{payment.payment_method || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate">{payment.payment_reference || '-'}</td>
                    <td className="px-4 py-3">
                      {payment.status !== 'paid' && (
                        <button
                          onClick={() => openPayForm(payment)}
                          className="text-xs font-medium text-primary-600 hover:text-primary-700"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Inline Mark Paid Form */}
        {payingId && (
          <div className="border-t border-gray-200 px-5 py-4 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Record Payment for #{payments.find((p) => p.id === payingId)?.payment_number}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Amount Paid</label>
                <input
                  type="number"
                  step="0.01"
                  value={payForm.amount_paid || ''}
                  onChange={(e) => setPayForm({ ...payForm, amount_paid: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Paid Date</label>
                <input
                  type="date"
                  value={payForm.paid_date}
                  onChange={(e) => setPayForm({ ...payForm, paid_date: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Payment Method</label>
                <input
                  type="text"
                  value={payForm.payment_method}
                  onChange={(e) => setPayForm({ ...payForm, payment_method: e.target.value })}
                  placeholder="wire, check, SINPE..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Reference</label>
                <input
                  type="text"
                  value={payForm.payment_reference}
                  onChange={(e) => setPayForm({ ...payForm, payment_reference: e.target.value })}
                  placeholder="Transaction ID..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleMarkPaid}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                Confirm Payment
              </button>
              <button
                onClick={() => setPayingId(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
