'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { Home, BookOpen, Calculator, Mail, LogIn, LogOut, Menu, X, Info, User } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useAuth } from '@/lib/auth'

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations('Navigation')
  const { user, logout } = useAuth()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  const navLinkClass = (path: string) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'text-primary-600 bg-primary-50'
        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
    }`

  const navLinks = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/how-it-works/borrowers', label: t('howItWorks'), icon: Info },
    { href: '/calculator', label: t('calculator'), icon: Calculator },
    { href: '/blog', label: t('blog'), icon: BookOpen },
    { href: '/contact', label: t('contact'), icon: Mail },
  ] as const

  const dashboardHref = user?.role === 'investor' ? '/investor' : user?.role === 'borrower' ? '/borrower' : '/'

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary-700">Lender</span>
              <span className="text-xl font-bold text-gold-500">.cr</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={navLinkClass(href)}>
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
            {user ? (
              <div className="ml-2 flex items-center gap-2">
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>{user.first_name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="ml-2 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>{t('login')}</span>
              </Link>
            )}
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(href) ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50"
                >
                  <User className="h-4 w-4" />
                  {user.first_name} {user.last_name}
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50"
              >
                <LogIn className="h-4 w-4" />
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
