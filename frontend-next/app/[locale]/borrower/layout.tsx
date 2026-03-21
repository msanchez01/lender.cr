'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { LayoutDashboard, FileText, Home as HomeIcon, Handshake, Settings } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function BorrowerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('BorrowerDashboard')

  useEffect(() => {
    if (!loading && (!user || user.role !== 'borrower')) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading || !user) return null

  const navItems = [
    { href: '/borrower', label: t('sidebarDashboard'), icon: LayoutDashboard },
    { href: '/borrower/applications', label: t('sidebarApplications'), icon: FileText },
    { href: '/borrower/properties', label: t('sidebarProperties'), icon: HomeIcon },
    { href: '/borrower/deals', label: t('sidebarDeals'), icon: Handshake },
    { href: '/borrower/settings', label: t('sidebarSettings'), icon: Settings },
  ]

  const isActive = (href: string) =>
    href === '/borrower' ? pathname === '/borrower' : pathname.startsWith(href)

  return (
    <div className="flex gap-6">
      <aside className="hidden md:block w-52 flex-shrink-0">
        <nav className="space-y-1 sticky top-24">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(href)
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
