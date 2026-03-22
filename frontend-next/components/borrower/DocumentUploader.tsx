'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Upload, X, Loader2, FileText, CheckCircle, Clock } from 'lucide-react'
import { borrowerApi } from '@/lib/api-client'
import type { PropertyDocument } from '@/lib/types'

interface DocumentUploaderProps {
  propertyId: string
  documents: PropertyDocument[]
  onUpload: () => void
}

const DOCUMENT_TYPES = ['escritura', 'plano', 'tax_receipt', 'appraisal', 'photo_id'] as const

const docTypeKeys: Record<string, string> = {
  escritura: 'docEscritura',
  plano: 'docPlano',
  tax_receipt: 'docTaxReceipt',
  appraisal: 'docAppraisal',
  photo_id: 'docPhotoId',
}

export default function DocumentUploader({ propertyId, documents, onUpload }: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>(DOCUMENT_TYPES[0])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations('PropertiesPage')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      await borrowerApi.uploadDocument(propertyId, file, selectedType)
      onUpload()
    } catch {
      // Error handled silently
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (docId: string) => {
    setDeletingId(docId)
    try {
      await borrowerApi.deleteDocument(propertyId, docId)
      onUpload()
    } catch {
      // Error handled silently
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('documentsSection')}</h3>

      {documents.length > 0 && (
        <div className="space-y-2 mb-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.file_name || doc.document_type}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-block px-1.5 py-0.5 bg-primary-50 text-primary-700 text-[10px] font-medium rounded">
                      {t(docTypeKeys[doc.document_type] || doc.document_type)}
                    </span>
                    {doc.is_verified ? (
                      <span className="flex items-center gap-0.5 text-[10px] text-success-600 font-medium">
                        <CheckCircle className="h-3 w-3" />
                        {t('verified')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-[10px] text-gray-400 font-medium">
                        <Clock className="h-3 w-3" />
                        {t('pending')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                disabled={deletingId === doc.id}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              >
                {deletingId === doc.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('documentTypeLabel')}
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(docTypeKeys[type])}
              </option>
            ))}
          </select>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors"
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
              <span>{t('saving')}</span>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6" />
              <span>{t('dragDropDocument')}</span>
              <span className="text-xs text-gray-400">{t('documentTypes')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
