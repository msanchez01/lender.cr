'use client'

import { useState, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Upload, X, Loader2 } from 'lucide-react'
import { borrowerApi } from '@/lib/api-client'
import type { PropertyImage } from '@/lib/types'

interface ImageUploaderProps {
  propertyId: string
  images: PropertyImage[]
  onUpload: () => void
}

export default function ImageUploader({ propertyId, images, onUpload }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadCount, setUploadCount] = useState(0)
  const [uploadTotal, setUploadTotal] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations('PropertiesPage')

  const uploadFiles = useCallback(async (files: File[]) => {
    const validFiles = files.filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    )
    if (validFiles.length === 0) return

    setUploading(true)
    setUploadTotal(validFiles.length)
    setUploadCount(0)

    for (const file of validFiles) {
      try {
        await borrowerApi.uploadImage(propertyId, file)
        setUploadCount((prev) => prev + 1)
      } catch {
        // Skip failed uploads, continue with the rest
      }
    }

    onUpload()
    setUploading(false)
    setUploadTotal(0)
    setUploadCount(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [propertyId, onUpload])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) uploadFiles(files)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) uploadFiles(files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const handleDelete = async (imageId: string) => {
    setDeletingId(imageId)
    try {
      await borrowerApi.deleteImage(propertyId, imageId)
      onUpload()
    } catch {
      // Error handled silently
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('imagesSection')}</h3>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {images.map((image) => (
            <div key={image.id} className="relative group rounded-lg overflow-hidden border border-gray-200">
              <img
                src={image.image_url}
                alt=""
                className="w-full h-32 object-cover"
              />
              {image.is_primary && (
                <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-primary-600 text-white text-[10px] font-medium rounded">
                  {t('primary')}
                </span>
              )}
              <button
                onClick={() => handleDelete(image.id)}
                disabled={deletingId === image.id}
                className="absolute top-2 right-2 p-1 bg-white/90 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {deletingId === image.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed rounded-lg text-sm cursor-pointer transition-colors ${
          dragOver
            ? 'border-primary-400 bg-primary-50 text-primary-600'
            : 'border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600'
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            <span>{uploadCount} / {uploadTotal}</span>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6" />
            <span>{t('dragDropImage')}</span>
            <span className="text-xs text-gray-400">{t('imageTypes')}</span>
          </>
        )}
      </div>
    </div>
  )
}
