import { Suspense } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { checkUserRole } from '@/lib/auth/check-role'
import { redirect } from 'next/navigation'
import { SearchAnalyticsContent } from './components/SearchAnalyticsContent'

export const dynamic = 'force-dynamic'

export default async function SearchAnalyticsPage() {
  const { isAdmin } = await checkUserRole()

  if (!isAdmin) {
    redirect('/unauthorized')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-neutral-900">
            📊 Analíticas de Búsqueda
          </h1>
        </div>

        <Suspense fallback={<LoadingSkeleton />}>
          <SearchAnalyticsContent />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-neutral-200 rounded-lg" />
        ))}
      </div>
      <div className="h-96 bg-neutral-200 rounded-lg" />
      <div className="h-96 bg-neutral-200 rounded-lg" />
    </div>
  )
}
