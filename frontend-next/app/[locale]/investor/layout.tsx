'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { LayoutDashboard, Store, Briefcase, TrendingUp, Settings } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('InvestorDashboard')

  useEffect(() => {
    if (!loading && (!user || user.role !== 'investor')) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading || !user) return null

  const navItems = [
    { href: '/investor', label: t('sidebarDashboard'), icon: LayoutDashboard },
    { href: '/investor/marketplace', label: t('sidebarMarketplace'), icon: Store },
    { href: '/investor/portfolio', label: t('sidebarPortfolio'), icon: Briefcase },
    { href: '/investor/returns', label: t('sidebarReturns'), icon: TrendingUp },
    { href: '/investor/settings', label: t('sidebarSettings'), icon: Settings },
  ]

  const isActive = (href: string) =>
    href === '/investor' ? pathname === '/investor' : pathname.startsWith(href)

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
