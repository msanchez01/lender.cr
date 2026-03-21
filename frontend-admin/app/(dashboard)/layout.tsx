import Link from 'next/link'
import { BookOpen, LayoutDashboard } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
          <Link
            href="/blog"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
          >
            <BookOpen className="h-4 w-4" />
            Blog Posts
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
