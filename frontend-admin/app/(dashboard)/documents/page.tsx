'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, ExternalLink, FileCheck } from 'lucide-react'
import api from '@/lib/api'

interface PendingDocument {
  id: string
  document_type: string
  file_name: string
  file_url: string
  property_address: string
  borrower_name: string
  uploaded_at: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<PendingDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<PendingDocument[]>('/admin/documents/pending')
      setDocuments(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  async function handleVerify(docId: string) {
    setVerifying(docId)
    try {
      await api.put(`/admin/documents/${docId}/verify`)
      await fetchDocuments()
    } catch {
      // silently fail
    } finally {
      setVerifying(null)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading documents...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Document Verification</h1>

      {documents.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileCheck className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <p className="text-lg font-medium text-gray-700">All caught up!</p>
          <p className="text-sm text-gray-400 mt-1">No documents pending verification.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
                  <th className="px-4 py-3 font-medium">Document Type</th>
                  <th className="px-4 py-3 font-medium">File Name</th>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Borrower</th>
                  <th className="px-4 py-3 font-medium">Uploaded</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {doc.document_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{doc.file_name}</td>
                    <td className="px-4 py-3 text-gray-500">{doc.property_address}</td>
                    <td className="px-4 py-3 text-gray-700">{doc.borrower_name}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-xs font-medium"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </a>
                        <button
                          onClick={() => handleVerify(doc.id)}
                          disabled={verifying === doc.id}
                          className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          {verifying === doc.id ? 'Verifying...' : 'Verify'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
