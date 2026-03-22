'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  FileCheck,
  FileText,
  Heart,
  LayoutDashboard,
  Users,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Applications', href: '/applications', icon: FileText },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Documents', href: '/documents', icon: FileCheck },
  { label: 'Interests', href: '/interests', icon: Heart },
  { label: 'Blog Posts', href: '/blog', icon: BookOpen },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="mb-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary-700">Lender</span>
            <span className="text-lg font-bold text-yellow-500">.cr</span>
            <span className="text-xs text-gray-400 ml-1">Admin</span>
          </Link>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 p-6">{children}</main>
    </div>
  )
}
