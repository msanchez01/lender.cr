'use client'

import { useState, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { PhoneInput } from 'react-international-phone'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { contactApi } from '@/lib/api-client'
import { trackContactFormSubmission } from '@/lib/utils/analytics'
import 'react-international-phone/style.css'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [userType, setUserType] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const turnstileRef = useRef<TurnstileInstance>(null)
  const t = useTranslations('ContactForm')
  const locale = useLocale()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) { setError(t('validationName')); return }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) { setError(t('validationEmail')); return }
    if (!message.trim()) { setError(t('validationMessage')); return }
    if (!userType) { setError(t('validationUserType')); return }
    if (TURNSTILE_SITE_KEY && !captchaToken) { setError(t('completeVerification')); return }

    setLoading(true)

    try {
      const phoneDigits = phone.replace(/\D/g, '')
      const phoneValue = phoneDigits.length >= 4 ? phone : undefined

      await contactApi.submitContact({
        name: name.trim(),
        email: email.trim(),
        phone: phoneValue,
        message: message.trim(),
        user_type: userType as 'borrower' | 'investor' | 'partner' | 'other',
        turnstile_token: TURNSTILE_SITE_KEY ? captchaToken : undefined,
      })

      trackContactFormSubmission()
      setSuccess(true)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } }
      if (axiosErr.response?.status === 429) {
        setError(t('tooManyRequests'))
      } else {
        setError(t('errorMessage'))
      }
      turnstileRef.current?.reset()
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 text-success-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('successTitle')}</h3>
        <p className="text-gray-500">{t('successMessage')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('nameLabel')}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('namePlaceholder')}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('emailLabel')}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('phoneLabel')}</label>
        <PhoneInput
          defaultCountry="cr"
          value={phone}
          onChange={setPhone}
          inputClassName="!w-full !px-3 !py-2.5 !border-gray-200 !rounded-lg !text-sm focus:!outline-none focus:!ring-2 focus:!ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('userTypeLabel')}</label>
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
        >
          <option value="">&mdash;</option>
          <option value="borrower">{t('userTypeBorrower')}</option>
          <option value="investor">{t('userTypeInvestor')}</option>
          <option value="partner">{t('userTypePartner')}</option>
          <option value="other">{t('userTypeOther')}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('messageLabel')}</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('messagePlaceholder')}
          rows={4}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
        />
      </div>

      {TURNSTILE_SITE_KEY && (
        <Turnstile
          ref={turnstileRef}
          siteKey={TURNSTILE_SITE_KEY}
          onSuccess={setCaptchaToken}
          onError={() => setCaptchaToken('')}
          onExpire={() => setCaptchaToken('')}
          options={{ size: 'flexible', theme: 'light', appearance: 'interaction-only' }}
        />
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('submitting')}
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {t('submitButton')}
          </>
        )}
      </button>
    </form>
  )
}
