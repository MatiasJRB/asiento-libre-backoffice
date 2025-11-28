import { DashboardLayout } from '@/components/dashboard-layout'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { RouteEditForm } from '@/components/admin/routes/RouteEditForm'
import type { Route } from '@/lib/types/routes-cities'

export const dynamic = 'force-dynamic'

async function getRoute(id: string): Promise<Route | null> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function EditRoutePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const route = await getRoute(id)

  if (!route) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={`Editar: ${route.name}`}
          description="Modificar información de la ruta"
        />
        
        <RouteEditForm route={route} />
      </div>
    </DashboardLayout>
  )
}
