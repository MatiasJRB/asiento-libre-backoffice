import { DashboardLayout } from '@/components/dashboard-layout'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { CityEditForm } from '@/components/admin/cities/CityEditForm'
import type { CoverageCity } from '@/lib/types/routes-cities'

export const dynamic = 'force-dynamic'

async function getCity(id: number): Promise<CoverageCity | null> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('coverage_cities')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

async function getActiveRoutes() {
  const supabase = createAdminClient()
  
  const { data: routes } = await supabase
    .from('routes')
    .select('id, name')
    .eq('is_active', true)
    .order('display_order', { ascending: true, nullsFirst: false })

  return routes || []
}

export default async function EditCityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const city = await getCity(parseInt(id))
  const routes = await getActiveRoutes()

  if (!city) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={`Editar: ${city.name}`}
          description="Modificar información de la ciudad"
        />
        
        <CityEditForm city={city} routes={routes} />
      </div>
    </DashboardLayout>
  )
}
