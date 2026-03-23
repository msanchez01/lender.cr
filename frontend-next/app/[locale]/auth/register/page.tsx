'use client'

import { useState, Suspense } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Link, useRouter } from '@/i18n/navigation'
import { UserPlus, Loader2, AlertCircle } from 'lucide-react'
import { PhoneInput } from 'react-international-phone'
import { useAuth } from '@/lib/auth'
import 'react-international-phone/style.css'

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') === 'investor' ? 'investor' : 'borrower'
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'borrower' | 'investor'>(defaultRole)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const t = useTranslations('AuthPage')
  const locale = useLocale()
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }

    const phoneDigits = phone.replace(/\D/g, '')
    if (phoneDigits.length < 8) {
      setError(t('phoneRequired'))
      return
    }

    setLoading(true)

    try {
      const phoneValue = phone.replace(/\D/g, '').length >= 8 ? phone : undefined
      const user = await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone: phoneValue,
        role,
        preferred_language: locale,
      })
      const dest = user.role === 'investor' ? '/investor' : '/borrower'
      router.push(dest)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } }
      if (axiosErr.response?.status === 409) {
        setError(t('emailExists'))
      } else {
        setError(t('genericError'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('registerTitle')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('registerDescription')}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('roleLabel')}</label>
            <div className="grid grid-cols-2 gap-3">
              {(['borrower', 'investor'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    role === r
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {r === 'borrower' ? t('roleBorrower') : t('roleInvestor')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('firstNameLabel')}</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('lastNameLabel')}</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('phoneLabel')} *</label>
            <PhoneInput
              defaultCountry="cr"
              value={phone}
              onChange={setPhone}
              inputClassName="!w-full !px-3 !py-2.5 !border-gray-200 !rounded-lg !text-sm focus:!outline-none focus:!ring-2 focus:!ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('passwordLabel')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('confirmPasswordLabel')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />{t('registering')}</> : <><UserPlus className="h-4 w-4" />{t('registerButton')}</>}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          {t('haveAccount')}{' '}
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
            {t('loginLink')}
          </Link>
        </div>
      </div>
    </div>
  )
}
