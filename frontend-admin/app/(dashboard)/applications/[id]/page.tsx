'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useApplications, Application } from '@/hooks/useApplications'
import StatusBadge from '@/components/admin/StatusBadge'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const ALL_STATUSES = [
  'draft', 'submitted', 'under_review', 'request_more_info',
  'appraisal_ordered', 'appraisal_complete',
  'approved', 'rejected', 'withdrawn', 'matching', 'funded', 'expired',
]

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { fetchApplication, updateStatus, recordAppraisal } = useApplications()
  const [app, setApp] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminNotes, setAdminNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [saving, setSaving] = useState(false)

  // Appraisal form
  const [showAppraisalForm, setShowAppraisalForm] = useState(false)
  const [appraisalForm, setAppraisalForm] = useState({
    appraiser_name: '',
    appraiser_company: '',
    appraised_value_usd: 0,
    appraisal_date: '',
    status: 'ordered',
    notes: '',
    cost_usd: 0,
  })

  const id = params.id as string

  async function load() {
    setLoading(true)
    const data = await fetchApplication(id)
    if (data) {
      setApp(data)
      setAdminNotes(data.admin_notes || '')
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleStatusChange(newStatus: string) {
    setSaving(true)
    const payload: { status: string; admin_notes?: string; rejection_reason?: string } = { status: newStatus }
    if (adminNotes) payload.admin_notes = adminNotes
    if (newStatus === 'rejected' && rejectionReason) payload.rejection_reason = rejectionReason
    const ok = await updateStatus(id, payload)
    if (ok) await load()
    setSaving(false)
  }

  async function handleSaveNotes() {
    setSaving(true)
    await updateStatus(id, { status: app!.status, admin_notes: adminNotes })
    setSaving(false)
  }

  async function handleRecordAppraisal() {
    setSaving(true)
    const ok = await recordAppraisal(id, {
      ...appraisalForm,
      notes: appraisalForm.notes || undefined,
    })
    if (ok) {
      setShowAppraisalForm(false)
      setAppraisalForm({
        appraiser_name: '',
        appraiser_company: '',
        appraised_value_usd: 0,
        appraisal_date: '',
        status: 'ordered',
        notes: '',
        cost_usd: 0,
      })
      await load()
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading application...</div>
  }

  if (!app) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Application not found.</div>
  }

  const availableStatuses = ALL_STATUSES.filter((s) => s !== app.status)

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/applications')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Application {app.application_number}</h1>
        <StatusBadge status={app.status} type="application" />
      </div>

      {/* Application Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Application Info</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Amount</p>
            <p className="font-medium text-gray-900">{fmt.format(app.amount_requested)}</p>
          </div>
          <div>
            <p className="text-gray-500">Term</p>
            <p className="font-medium text-gray-900">{app.preferred_term_months} months</p>
          </div>
          <div>
            <p className="text-gray-500">Purpose</p>
            <p className="font-medium text-gray-900">{app.purpose}</p>
          </div>
          <div>
            <p className="text-gray-500">LTV</p>
            <p className="font-medium text-gray-900">{app.preliminary_ltv != null ? `${Number(app.preliminary_ltv).toFixed(1)}%` : '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Created</p>
            <p className="font-medium text-gray-900">{app.created_at ? new Date(app.created_at).toLocaleDateString() : '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Submitted</p>
            <p className="font-medium text-gray-900">{app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '—'}</p>
          </div>
        </div>
      </div>

      {/* Status Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Change Status</h2>
        <div className="mb-3">
          <label className="block text-sm text-gray-500 mb-1">Rejection Reason (if rejecting)</label>
          <input
            type="text"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Reason for rejection..."
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value=""
            onChange={(e) => { if (e.target.value) handleStatusChange(e.target.value) }}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">— Change to —</option>
            {availableStatuses.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
          {saving && <Loader2 className="h-4 w-4 animate-spin text-primary-500" />}
        </div>
      </div>

      {/* Admin Notes */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Admin Notes</h2>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
          placeholder="Internal notes..."
        />
        <button
          onClick={handleSaveNotes}
          disabled={saving}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          Save Notes
        </button>
      </div>

      {/* Borrower Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Borrower Info</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-medium text-gray-900">{app.borrower_name}</p>
          </div>
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{app.borrower_email}</p>
          </div>
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium text-gray-900">{app.borrower_phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">KYC</p>
            <p className="font-medium">
              {app.borrower_kyc_verified ? (
                <span className="inline-flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-red-500">
                  <XCircle className="h-4 w-4" /> Not Verified
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Property Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Property Info</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-500">Type</p>
            <p className="font-medium text-gray-900">{app.property_type}</p>
          </div>
          <div>
            <p className="text-gray-500">Address</p>
            <p className="font-medium text-gray-900">{app.property_address}</p>
          </div>
          <div>
            <p className="text-gray-500">City</p>
            <p className="font-medium text-gray-900">{app.property_city}</p>
          </div>
          <div>
            <p className="text-gray-500">Value</p>
            <p className="font-medium text-gray-900">{fmt.format(app.property_value_usd)}</p>
          </div>
        </div>

        {/* Images */}
        {app.property_images && app.property_images.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Images</p>
            <div className="flex flex-wrap gap-2">
              {app.property_images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Property image ${i + 1}`}
                  className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                />
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {app.property_documents && app.property_documents.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Documents</p>
            <div className="space-y-1">
              {app.property_documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 text-sm">
                  <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">
                    {doc.file_name}
                  </a>
                  <span className="text-gray-400">({doc.type})</span>
                  {doc.verified ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Appraisals */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Appraisals</h2>
          <button
            onClick={() => setShowAppraisalForm(!showAppraisalForm)}
            className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            {showAppraisalForm ? 'Cancel' : 'Record Appraisal'}
          </button>
        </div>

        {app.appraisals && app.appraisals.length > 0 && (
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-2 font-medium">Appraiser</th>
                  <th className="pb-2 font-medium">Company</th>
                  <th className="pb-2 font-medium">Value</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {app.appraisals.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2 text-gray-700">{a.appraiser_name}</td>
                    <td className="py-2 text-gray-500">{a.appraiser_company}</td>
                    <td className="py-2 text-gray-700">{fmt.format(a.appraised_value_usd)}</td>
                    <td className="py-2 text-gray-400">{new Date(a.appraisal_date).toLocaleDateString()}</td>
                    <td className="py-2">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-2 text-gray-500">{fmt.format(a.cost_usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showAppraisalForm && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Appraiser Name</label>
                <input
                  type="text"
                  value={appraisalForm.appraiser_name}
                  onChange={(e) => setAppraisalForm({ ...appraisalForm, appraiser_name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Appraiser Company</label>
                <input
                  type="text"
                  value={appraisalForm.appraiser_company}
                  onChange={(e) => setAppraisalForm({ ...appraisalForm, appraiser_company: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Appraised Value (USD)</label>
                <input
                  type="number"
                  value={appraisalForm.appraised_value_usd || ''}
                  onChange={(e) => setAppraisalForm({ ...appraisalForm, appraised_value_usd: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Appraisal Date</label>
                <input
                  type="date"
                  value={appraisalForm.appraisal_date}
                  onChange={(e) => setAppraisalForm({ ...appraisalForm, appraisal_date: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select
                  value={appraisalForm.status}
                  onChange={(e) => setAppraisalForm({ ...appraisalForm, status: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ordered">Ordered</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Cost (USD)</label>
                <input
                  type="number"
                  value={appraisalForm.cost_usd || ''}
                  onChange={(e) => setAppraisalForm({ ...appraisalForm, cost_usd: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Notes</label>
              <textarea
                value={appraisalForm.notes}
                onChange={(e) => setAppraisalForm({ ...appraisalForm, notes: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={handleRecordAppraisal}
              disabled={saving}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              Save Appraisal
            </button>
          </div>
        )}

        {(!app.appraisals || app.appraisals.length === 0) && !showAppraisalForm && (
          <p className="text-sm text-gray-400">No appraisals recorded.</p>
        )}
      </div>

      {/* Investor Interests */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Investor Interests</h2>
        {app.interests && app.interests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-2 font-medium">Investor</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Rate</th>
                  <th className="pb-2 font-medium">Message</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {app.interests.map((interest) => (
                  <tr key={interest.id}>
                    <td className="py-2 text-gray-700">{interest.investor_name}</td>
                    <td className="py-2 text-gray-700">{fmt.format(interest.amount_willing_usd)}</td>
                    <td className="py-2 text-gray-700">{interest.proposed_rate}%</td>
                    <td className="py-2 text-gray-500 max-w-xs truncate">{interest.message || '-'}</td>
                    <td className="py-2">
                      <StatusBadge status={interest.status} type="interest" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No investor interests yet.</p>
        )}
      </div>
    </div>
  )
}
