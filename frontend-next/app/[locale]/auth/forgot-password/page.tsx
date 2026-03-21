'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { authForgotPassword } from '@/lib/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const t = useTranslations('AuthPage')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authForgotPassword(email)
      setSent(true)
    } catch {
      setError(t('genericError'))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <CheckCircle className="h-12 w-12 text-success-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('forgotPasswordTitle')}</h1>
        <p className="text-gray-500 mb-6">{t('resetSent')}</p>
        <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
          {t('loginLink')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('forgotPasswordTitle')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('forgotPasswordDescription')}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('emailLabel')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />{t('sending')}</> : <><Mail className="h-4 w-4" />{t('sendResetLink')}</>}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-500">
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
            {t('loginLink')}
          </Link>
        </div>
      </div>
    </div>
  )
}
