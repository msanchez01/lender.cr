'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { useUsers, User } from '@/hooks/useUsers'
import StatusBadge from '@/components/admin/StatusBadge'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { fetchUser, updateUser } = useUsers()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusVal, setStatusVal] = useState('')
  const [kycVal, setKycVal] = useState(false)

  const id = params.id as string

  async function load() {
    setLoading(true)
    const data = await fetchUser(id)
    if (data) {
      setUser(data)
      setStatusVal(data.status)
      setKycVal(data.kyc_verified)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleSave() {
    setSaving(true)
    const ok = await updateUser(id, { status: statusVal, kyc_verified: kycVal } as Partial<User>)
    if (ok) await load()
    setSaving(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading user...</div>
  }

  if (!user) {
    return <div className="flex items-center justify-center h-64 text-gray-400">User not found.</div>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/users')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {user.first_name} {user.last_name}
        </h1>
        <StatusBadge status={user.status} type="user" />
      </div>

      {/* User Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">User Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{user.email}</p>
          </div>
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium text-gray-900">{user.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">WhatsApp</p>
            <p className="font-medium text-gray-900">{user.whatsapp_number || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">Role</p>
            <p className="font-medium text-gray-900 capitalize">{user.role}</p>
          </div>
          <div>
            <p className="text-gray-500">Language</p>
            <p className="font-medium text-gray-900">{user.preferred_language}</p>
          </div>
          <div>
            <p className="text-gray-500">Email Verified</p>
            <p className="font-medium">
              {user.email_verified ? (
                <span className="inline-flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" /> Yes
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-red-500">
                  <XCircle className="h-4 w-4" /> No
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Joined</p>
            <p className="font-medium text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Updated</p>
            <p className="font-medium text-gray-900">{new Date(user.updated_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Actions</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">KYC Verified</label>
            <button
              onClick={() => setKycVal(!kycVal)}
              className={`rounded-lg px-4 py-2 text-sm font-medium border ${
                kycVal
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-gray-50 border-gray-300 text-gray-600'
              }`}
            >
              {kycVal ? 'Verified' : 'Not Verified'}
            </button>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              value={statusVal}
              onChange={(e) => setStatusVal(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Borrower Profile */}
      {user.role === 'borrower' && user.borrower_profile && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Borrower Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Type</p>
              <p className="font-medium text-gray-900 capitalize">{user.borrower_profile.type}</p>
            </div>
            <div>
              <p className="text-gray-500">Nationality</p>
              <p className="font-medium text-gray-900">{user.borrower_profile.nationality}</p>
            </div>
            <div>
              <p className="text-gray-500">Residency Status</p>
              <p className="font-medium text-gray-900 capitalize">{user.borrower_profile.residency_status}</p>
            </div>
            <div>
              <p className="text-gray-500">Applications</p>
              <p className="font-medium text-gray-900">{user.borrower_profile.application_count}</p>
            </div>
            <div>
              <p className="text-gray-500">Properties</p>
              <p className="font-medium text-gray-900">{user.borrower_profile.property_count}</p>
            </div>
          </div>
        </div>
      )}

      {/* Investor Profile */}
      {user.role === 'investor' && user.investor_profile && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Investor Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Accreditation</p>
              <p className="font-medium text-gray-900 capitalize">{user.investor_profile.accreditation_status}</p>
            </div>
            <div>
              <p className="text-gray-500">Min Investment</p>
              <p className="font-medium text-gray-900">{fmt.format(user.investor_profile.min_investment_usd)}</p>
            </div>
            <div>
              <p className="text-gray-500">Max Investment</p>
              <p className="font-medium text-gray-900">{fmt.format(user.investor_profile.max_investment_usd)}</p>
            </div>
            <div>
              <p className="text-gray-500">Interests</p>
              <p className="font-medium text-gray-900">{user.investor_profile.interest_count}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
