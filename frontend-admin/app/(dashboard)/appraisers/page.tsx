'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Pencil, XCircle, CheckCircle } from 'lucide-react'
import { useAppraisers, type Appraiser } from '@/hooks/useAppraisers'

export default function AppraisersPage() {
  const {
    appraisers,
    total,
    loading,
    fetchAppraisers,
    createAppraiser,
    deleteAppraiser,
    updateAppraiser,
  } = useAppraisers()
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [filterActive, setFilterActive] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
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
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const params: { search?: string; is_active?: boolean } = {}
    if (debounced) params.search = debounced
    if (filterActive === 'active') params.is_active = true
    if (filterActive === 'inactive') params.is_active = false
    fetchAppraisers(params)
  }, [debounced, filterActive, fetchAppraisers])

  const handleDeactivate = useCallback(
    async (id: string) => {
      await deleteAppraiser(id)
      const params: { search?: string; is_active?: boolean } = {}
      if (debounced) params.search = debounced
      if (filterActive === 'active') params.is_active = true
      if (filterActive === 'inactive') params.is_active = false
      fetchAppraisers(params)
    },
    [deleteAppraiser, fetchAppraisers, debounced, filterActive]
  )

  const handleReactivate = useCallback(
    async (id: string) => {
      await updateAppraiser(id, { is_active: true })
      const params: { search?: string; is_active?: boolean } = {}
      if (debounced) params.search = debounced
      if (filterActive === 'active') params.is_active = true
      if (filterActive === 'inactive') params.is_active = false
      fetchAppraisers(params)
    },
    [updateAppraiser, fetchAppraisers, debounced, filterActive]
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createAppraiser(formData)
      setShowForm(false)
      setFormData({
        company_name: '',
        appraiser_name: '',
        phone: '',
        email: '',
        license_number: '',
        specialties: '',
        regions: '',
        notes: '',
      })
      const params: { search?: string; is_active?: boolean } = {}
      if (debounced) params.search = debounced
      if (filterActive === 'active') params.is_active = true
      if (filterActive === 'inactive') params.is_active = false
      fetchAppraisers(params)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appraisers</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Appraiser
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              required
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
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
              License #
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
              onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="md:col-span-2 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Create Appraiser'}
            </button>
          </div>
        </form>
      )}

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, or email..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : appraisers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No appraisers found.</div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-700">
                    Company
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">
                    License #
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">
                    Regions
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {appraisers.map((a: Appraiser) => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {a.company_name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{a.appraiser_name}</td>
                    <td className="px-4 py-3 text-gray-500">{a.phone || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{a.email || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{a.license_number || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">
                      {a.regions || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          a.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {a.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/appraisers/${a.id}`}
                          className="text-primary-600 hover:text-primary-700"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        {a.is_active ? (
                          <button
                            onClick={() => handleDeactivate(a.id)}
                            className="text-red-500 hover:text-red-600"
                            title="Deactivate"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(a.id)}
                            className="text-green-500 hover:text-green-600"
                            title="Reactivate"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-gray-500">{total} appraisers total</div>
        </>
      )}
    </div>
  )
}
