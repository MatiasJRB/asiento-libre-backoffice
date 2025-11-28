'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Usuarios', href: '/users' },
  { name: 'Viajes', href: '/rides' },
  { name: 'Reportes', href: '/reports' },
  { name: 'Leads', href: '/leads' },
  { name: 'Rutas', href: '/admin/routes' },
  { name: 'Ciudades', href: '/admin/cities' },
  { name: 'Analíticas', href: '/search-analytics' },
  { name: 'Design System', href: '/design-system' },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-[#d1450a]">
                Asiento Libre
              </h1>
              
              <nav className="hidden md:flex space-x-4">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#d1450a]/10 text-[#d1450a] border-b-2 border-[#d1450a]'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="text-sm text-neutral-700 hover:text-[#d1450a] font-medium transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-2 flex space-x-2 overflow-x-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-[#d1450a]/10 text-[#d1450a] border-b-2 border-[#d1450a]'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
