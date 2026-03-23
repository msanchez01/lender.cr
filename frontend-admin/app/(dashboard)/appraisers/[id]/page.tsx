'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAppraisers, type Appraiser } from '@/hooks/useAppraisers'

export default function AppraiserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { fetchAppraiser, updateAppraiser } = useAppraisers()
  const [appraiser, setAppraiser] = useState<Appraiser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    company_name: '',
    appraiser_name: '',
    phone: '',
    email: '',
    license_number: '',
    specialties: '',
    regions: '',
    notes: '',
  })

  useEffect(() => {
    if (id) {
      fetchAppraiser(id).then((a) => {
        if (a) {
          setAppraiser(a)
          setFormData({
            company_name: a.company_name,
            appraiser_name: a.appraiser_name,
            phone: a.phone || '',
            email: a.email || '',
            license_number: a.license_number || '',
            specialties: a.specialties || '',
            regions: a.regions || '',
            notes: a.notes || '',
          })
        } else {
          router.push('/appraisers')
        }
        setLoading(false)
      })
    }
  }, [id, fetchAppraiser, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess('')
    try {
      const updated = await updateAppraiser(id, formData)
      setAppraiser(updated)
      setSuccess('Appraiser updated successfully.')
      setTimeout(() => setSuccess(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async () => {
    if (!appraiser) return
    setSaving(true)
    try {
      const updated = await updateAppraiser(id, {
        is_active: !appraiser.is_active,
      })
      setAppraiser(updated)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>
  }

  if (!appraiser) {
    return <div className="text-center py-12 text-gray-500">Appraiser not found.</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/appraisers"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Appraiser</h1>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              appraiser.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {appraiser.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <button
          onClick={handleToggleActive}
          disabled={saving}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
            appraiser.is_active
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-50 text-green-600 hover:bg-green-100'
          }`}
        >
          {appraiser.is_active ? 'Deactivate' : 'Reactivate'}
        </button>
      </div>

      {success && (
        <div className="mb-4 px-4 py-2 bg-green-50 text-green-700 text-sm rounded-lg">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-white border border-gray-200 rounded-lg p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              required
              value={formData.company_name}
              onChange={(e) =>
                setFormData({ ...formData, company_name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appraiser Name *
            </label>
            <input
              required
              value={formData.appraiser_name}
              onChange={(e) =>
                setFormData({ ...formData, appraiser_name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Number
            </label>
            <input
              value={formData.license_number}
              onChange={(e) =>
                setFormData({ ...formData, license_number: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialties
            </label>
            <input
              value={formData.specialties}
              onChange={(e) =>
                setFormData({ ...formData, specialties: e.target.value })
              }
              placeholder="residential, commercial, land"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Regions</label>
            <input
              value={formData.regions}
              onChange={(e) => setFormData({ ...formData, regions: e.target.value })}
              placeholder="Escazu, Santa Ana, Guanacaste"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
