'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { FileText, ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function BorrowerDashboard() {
  const { user } = useAuth()
  const t = useTranslations('BorrowerDashboard')

  if (!user) return null

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {t('welcomeTitle', { name: user.first_name })}
      </h1>
      <p className="text-gray-500 mb-8">{t('welcomeDescription')}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <FileText className="h-10 w-10 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">{t('noApplications')}</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          {t('applyNow')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
