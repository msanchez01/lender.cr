'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  User,
  FileText,
  DollarSign,
  Calendar,
  MapPin,
  Maximize2,
  Image as ImageIcon,
  ExternalLink,
  Mail,
  Phone,
  Shield,
  Clock,
  TrendingUp,
  Percent,
} from 'lucide-react'
import { useApplications } from '@/hooks/useApplications'
import api from '@/lib/api'
import StatusBadge from '@/components/admin/StatusBadge'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const fmtDecimal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtNum = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })

const PURPOSE_LABELS: Record<string, string> = {
  property_purchase: 'Property Purchase',
  refinance: 'Refinance',
  construction: 'Construction',
  renovation: 'Renovation',
  land_acquisition: 'Land Acquisition',
  debt_consolidation: 'Debt Consolidation',
  business_expansion: 'Business Expansion',
  other: 'Other',
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  house: 'House',
  apartment: 'Apartment',
  condo: 'Condo',
  land: 'Land',
  commercial: 'Commercial',
  industrial: 'Industrial',
  farm: 'Farm',
  mixed_use: 'Mixed Use',
  other: 'Other',
}

const DOC_TYPE_LABELS: Record<string, string> = {
  title_deed: 'Title Deed',
  appraisal_report: 'Appraisal Report',
  tax_receipt: 'Tax Receipt',
  survey_plan: 'Survey Plan',
  insurance_policy: 'Insurance Policy',
  photo: 'Photo',
  other: 'Other',
}

const ALL_STATUSES = [
  'draft', 'submitted', 'under_review', 'request_more_info',
  'appraisal_ordered', 'appraisal_complete',
  'approved', 'rejected', 'withdrawn', 'matching', 'funded', 'expired',
]

function InfoItem({ icon: Icon, label, value, mono }: { icon?: React.ElementType; label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <p className={`font-medium text-gray-900 text-sm ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  )
}

function SectionCard({ title, icon: Icon, children, headerRight }: { title: string; icon: React.ElementType; children: React.ReactNode; headerRight?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Icon className="h-5 w-5 text-gray-400" />
          {title}
        </h2>
        {headerRight}
      </div>
      {children}
    </div>
  )
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { fetchApplication, updateStatus, recordAppraisal } = useApplications()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [app, setApp] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [adminNotes, setAdminNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [saving, setSaving] = useState(false)

  // Appraisal form
  const [showAppraisalForm, setShowAppraisalForm] = useState(false)
  const [appraisers, setAppraisers] = useState<{ id: string; appraiser_name: string; company_name: string }[]>([])
  const [appraisalForm, setAppraisalForm] = useState({
    appraiser_id: '',
    appraiser_name: '',
    appraiser_company: '',
    appraised_value_usd: 0,
    appraisal_date: '',
    status: 'not_requested',
    notes: '',
    cost_usd: 0,
  })
  const [sendingEmail, setSendingEmail] = useState(false)

  const id = params.id as string

  async function load() {
    setLoading(true)
    const data = await fetchApplication(id)
    if (data) {
      setApp(data)
      setAdminNotes('')
    }
    // Fetch appraisers for dropdown
    try {
      const { data: appraiserData } = await api.get('/admin/appraisers?is_active=true')
      setAppraisers(appraiserData.items || [])
    } catch { /* ignore */ }
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
    const timestamp = new Date().toLocaleString()
    const newNote = `[${timestamp} — Admin] ${adminNotes}`
    const existing = app?.admin_notes || ''
    const combined = existing ? `${newNote}\n---\n${existing}` : newNote
    const ok = await updateStatus(id, { status: app!.status, admin_notes: combined })
    if (ok) {
      await load()
      setAdminNotes('')
    }
    setSaving(false)
  }

  async function handleRecordAppraisal(sendEmail = false) {
    setSaving(true)
    try {
      // Create the appraisal
      const result = await api.post(`/admin/applications/${id}/appraisal`, {
        ...appraisalForm,
        notes: appraisalForm.notes || undefined,
      })
      const appraisalId = result.data?.appraisal_id

      // Send email if requested
      if (sendEmail && appraisalId) {
        try {
          await api.post(`/admin/applications/${id}/appraisal/${appraisalId}/send`)
          alert('Appraisal saved and request sent to appraiser!')
        } catch (err: unknown) {
          const axiosErr = err as { response?: { data?: { detail?: string } } }
          alert(`Appraisal saved, but email failed: ${axiosErr.response?.data?.detail || 'Unknown error'}`)
        }
      }

      setShowAppraisalForm(false)
      setAppraisalForm({
        appraiser_id: '',
        appraiser_name: '',
        appraiser_company: '',
        appraised_value_usd: 0,
        appraisal_date: '',
        status: 'not_requested',
        notes: '',
        cost_usd: 0,
      })
      await load()
    } catch {
      alert('Failed to save appraisal.')
    }
    setSaving(false)
  }

  async function handleSendToAppraiser(appraisalId: string) {
    setSendingEmail(true)
    try {
      await api.post(`/admin/applications/${id}/appraisal/${appraisalId}/send`)
      await load()
      alert('Appraisal request sent!')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      alert(axiosErr.response?.data?.detail || 'Failed to send email')
    } finally {
      setSendingEmail(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading application...
      </div>
    )
  }

  if (!app) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Application not found.</div>
  }

  const availableStatuses = ALL_STATUSES.filter((s) => s !== app.status)
  const property = app.property
  const borrower = app.borrower
  const images = property?.images || []
  const documents = property?.documents || []
  const appraisals = app.appraisals || []
  const interests = app.interests || []

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/applications')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Application {app.application_number}</h1>
            <StatusBadge status={app.status} type="application" />
          </div>
          {app.rejection_reason && (
            <p className="text-sm text-red-600 mt-1">Rejection reason: {app.rejection_reason}</p>
          )}
        </div>
      </div>

      {/* Application Info */}
      <SectionCard title="Application Details" icon={FileText}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-sm">
          <InfoItem icon={DollarSign} label="Amount Requested" value={fmt.format(app.amount_requested)} mono />
          <InfoItem icon={DollarSign} label="Currency" value={(app.currency || 'USD').toUpperCase()} />
          <InfoItem label="Purpose" value={PURPOSE_LABELS[app.purpose] || app.purpose || '—'} />
          {app.purpose_description && (
            <InfoItem label="Purpose Details" value={app.purpose_description} />
          )}
          <InfoItem icon={Calendar} label="Preferred Term" value={app.preferred_term_months ? `${app.preferred_term_months} months` : '—'} />
          <InfoItem icon={Percent} label="Max Interest Rate" value={app.max_interest_rate_monthly != null ? `${Number(app.max_interest_rate_monthly).toFixed(2)}% /mo` : '—'} />
          <InfoItem icon={TrendingUp} label="Preliminary LTV" value={app.preliminary_ltv != null ? `${Number(app.preliminary_ltv).toFixed(1)}%` : '—'} />
          <InfoItem icon={TrendingUp} label="Final LTV" value={app.final_ltv != null ? `${Number(app.final_ltv).toFixed(1)}%` : '—'} />
        </div>
        <div className="border-t border-gray-100 mt-4 pt-4 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
          <InfoItem icon={Clock} label="Created" value={app.created_at ? new Date(app.created_at).toLocaleString() : '—'} />
          <InfoItem icon={Clock} label="Submitted" value={app.submitted_at ? new Date(app.submitted_at).toLocaleString() : '—'} />
          <InfoItem icon={Clock} label="Approved" value={app.approved_at ? new Date(app.approved_at).toLocaleString() : '—'} />
        </div>
      </SectionCard>

      {/* Borrower Info */}
      <SectionCard title="Borrower" icon={User}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-sm">
          <InfoItem icon={User} label="Name" value={borrower?.name} />
          <InfoItem icon={Mail} label="Email" value={
            borrower?.email ? (
              <a href={`mailto:${borrower.email}`} className="text-primary-600 hover:underline">{borrower.email}</a>
            ) : '—'
          } />
          <InfoItem icon={Phone} label="Phone" value={borrower?.phone || 'N/A'} />
          <div>
            <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              KYC Status
            </p>
            {borrower?.kyc_verified ? (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
                <CheckCircle className="h-4 w-4" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-red-500">
                <XCircle className="h-4 w-4" /> Not Verified
              </span>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Property Info */}
      <SectionCard title="Property" icon={Building2}>
        {property ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-sm">
              <InfoItem label="Type" value={PROPERTY_TYPE_LABELS[property.property_type] || property.property_type || '—'} />
              <InfoItem icon={MapPin} label="Address" value={property.address} />
              <InfoItem label="City" value={property.city} />
              <InfoItem label="Province" value={property.province} />
              <InfoItem icon={DollarSign} label="Estimated Value" value={property.estimated_value_usd != null ? fmt.format(property.estimated_value_usd) : '—'} mono />
              <InfoItem icon={DollarSign} label="Appraised Value" value={property.appraised_value_usd != null ? fmt.format(property.appraised_value_usd) : '—'} mono />
              <InfoItem icon={Maximize2} label="Lot Size" value={property.lot_size_sqm != null ? `${fmtNum.format(property.lot_size_sqm)} sqm` : '—'} />
              <InfoItem icon={Maximize2} label="Built Area" value={property.built_area_sqm != null ? `${fmtNum.format(property.built_area_sqm)} sqm` : '—'} />
            </div>

            {/* Property Images */}
            {images.length > 0 && (
              <div className="mt-5">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  Property Photos ({images.length})
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {images.map((img: { id: string; image_url: string; is_primary: boolean }) => (
                    <a
                      key={img.id}
                      href={img.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative block aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-primary-400 transition-colors"
                    >
                      <img
                        src={img.image_url}
                        alt="Property"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {img.is_primary && (
                        <span className="absolute top-1 left-1 bg-primary-600 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                      <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                        <ExternalLink className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Property Documents */}
            {documents.length > 0 && (
              <div className="mt-5">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Documents ({documents.length})
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-gray-500">
                        <th className="pb-2 font-medium">Type</th>
                        <th className="pb-2 font-medium">File Name</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {documents.map((doc: { id: string; document_type: string; file_url: string; file_name: string; is_verified: boolean }) => (
                        <tr key={doc.id}>
                          <td className="py-2">
                            <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2.5 py-0.5 text-xs font-medium">
                              {DOC_TYPE_LABELS[doc.document_type] || doc.document_type}
                            </span>
                          </td>
                          <td className="py-2 text-gray-700">{doc.file_name}</td>
                          <td className="py-2">
                            {doc.is_verified ? (
                              <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                                <CheckCircle className="h-3.5 w-3.5" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-500 text-xs font-medium">
                                <Clock className="h-3.5 w-3.5" /> Pending
                              </span>
                            )}
                          </td>
                          <td className="py-2 text-right">
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-xs font-medium"
                            >
                              View <ExternalLink className="h-3 w-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {images.length === 0 && documents.length === 0 && (
              <p className="text-sm text-gray-400 mt-4">No images or documents uploaded.</p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400">No property linked to this application.</p>
        )}
      </SectionCard>

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
            <option value="">-- Change to --</option>
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

        {app.admin_notes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto border border-gray-100">
            {app.admin_notes}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Add a note..."
            onKeyDown={(e) => { if (e.key === 'Enter' && adminNotes.trim()) handleSaveNotes() }}
          />
          <button
            onClick={handleSaveNotes}
            disabled={saving || !adminNotes.trim()}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Add Note'}
          </button>
        </div>
      </div>

      {/* Appraisals */}
      <SectionCard
        title="Appraisals"
        icon={FileText}
        headerRight={
          <button
            onClick={() => setShowAppraisalForm(!showAppraisalForm)}
            className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            {showAppraisalForm ? 'Cancel' : 'Record Appraisal'}
          </button>
        }
      >
        {appraisals.length > 0 && (
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
                  <th className="pb-2 font-medium">Notes</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appraisals.map((a: { id: string; appraiser_name: string; appraiser_company: string; appraised_value_usd: number | null; appraisal_date: string | null; status: string; cost_usd: number | null; notes: string | null }) => (
                  <tr key={a.id}>
                    <td className="py-2 text-gray-700">{a.appraiser_name}</td>
                    <td className="py-2 text-gray-500">{a.appraiser_company}</td>
                    <td className="py-2 text-gray-700 font-mono">{a.appraised_value_usd != null ? fmt.format(a.appraised_value_usd) : '—'}</td>
                    <td className="py-2 text-gray-400">{a.appraisal_date ? new Date(a.appraisal_date).toLocaleDateString() : '—'}</td>
                    <td className="py-2">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-2 text-gray-500">{a.cost_usd != null ? fmtDecimal.format(a.cost_usd) : '—'}</td>
                    <td className="py-2 text-gray-500 max-w-[200px] truncate">{a.notes || '—'}</td>
                    <td className="py-2">
                      {a.status?.toLowerCase() !== 'ordered' && a.status?.toLowerCase() !== 'completed' && a.status?.toLowerCase() !== 'scheduled' && a.appraiser_name && (
                        <button
                          onClick={() => handleSendToAppraiser(a.id)}
                          disabled={sendingEmail}
                          className="text-xs bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                        >
                          {sendingEmail ? 'Sending...' : 'Send to Appraiser'}
                        </button>
                      )}
                      {a.status?.toLowerCase() === 'ordered' && (
                        <span className="text-xs text-green-600">✓ Email sent</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showAppraisalForm && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Select Appraiser</label>
                <select
                  value={appraisalForm.appraiser_id}
                  onChange={(e) => {
                    const selected = appraisers.find((a) => a.id === e.target.value)
                    setAppraisalForm({
                      ...appraisalForm,
                      appraiser_id: e.target.value,
                      appraiser_name: selected?.appraiser_name || '',
                      appraiser_company: selected?.company_name || '',
                    })
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">— Select an appraiser —</option>
                  {appraisers.map((a) => (
                    <option key={a.id} value={a.id}>{a.appraiser_name} — {a.company_name}</option>
                  ))}
                </select>
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
                  <option value="not_requested">Not Requested</option>
                  <option value="ordered">Ordered</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="disputed">Disputed</option>
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
            <div className="flex gap-3">
              <button
                onClick={() => handleRecordAppraisal(false)}
                disabled={saving}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >
                Save Only
              </button>
              {appraisalForm.appraiser_id && (
                <button
                  onClick={() => handleRecordAppraisal(true)}
                  disabled={saving}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Saving & Sending...' : 'Save & Send to Appraiser'}
                </button>
              )}
            </div>
          </div>
        )}

        {appraisals.length === 0 && !showAppraisalForm && (
          <p className="text-sm text-gray-400">No appraisals recorded.</p>
        )}
      </SectionCard>

      {/* Investor Interests */}
      <SectionCard title={`Investor Interests (${interests.length})`} icon={DollarSign}>
        {interests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-2 font-medium">Investor</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Rate (/mo)</th>
                  <th className="pb-2 font-medium">Message</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {interests.map((interest: { id: string; investor_name: string; investor_email: string; amount_willing: number | null; proposed_rate_monthly: number | null; message: string | null; status: string; created_at: string | null }) => (
                  <tr key={interest.id}>
                    <td className="py-2 text-gray-700 font-medium">{interest.investor_name}</td>
                    <td className="py-2 text-gray-500">
                      {interest.investor_email ? (
                        <a href={`mailto:${interest.investor_email}`} className="text-primary-600 hover:underline">
                          {interest.investor_email}
                        </a>
                      ) : '—'}
                    </td>
                    <td className="py-2 text-gray-700 font-mono">{interest.amount_willing != null ? fmt.format(interest.amount_willing) : '—'}</td>
                    <td className="py-2 text-gray-700">{interest.proposed_rate_monthly != null ? `${Number(interest.proposed_rate_monthly).toFixed(2)}%` : '—'}</td>
                    <td className="py-2 text-gray-500 max-w-[200px] truncate">{interest.message || '—'}</td>
                    <td className="py-2">
                      <StatusBadge status={interest.status} type="interest" />
                    </td>
                    <td className="py-2 text-gray-400 whitespace-nowrap">{interest.created_at ? new Date(interest.created_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No investor interests yet.</p>
        )}
      </SectionCard>
    </div>
  )
}
