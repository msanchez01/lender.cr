'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { authVerifyEmail } from '@/lib/auth'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const t = useTranslations('AuthPage')
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }
    authVerifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="max-w-md mx-auto py-12 text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="h-12 w-12 text-primary-500 mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-gray-900">{t('verifyEmailTitle')}</h1>
          <p className="text-gray-500 mt-2">{t('verifying')}</p>
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle className="h-12 w-12 text-success-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('verifyEmailTitle')}</h1>
          <p className="text-gray-500 mb-6">{t('verifySuccess')}</p>
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
            {t('loginLink')}
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('verifyEmailTitle')}</h1>
          <p className="text-gray-500 mb-6">{t('verifyFailed')}</p>
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            Home
          </Link>
        </>
      )}
    </div>
  )
}
