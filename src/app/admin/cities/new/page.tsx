import { DashboardLayout } from '@/components/dashboard-layout'
import { createAdminClient } from '@/lib/supabase/admin'
import { PageHeader } from '@/components/ui/page-header'
import { CityForm } from '@/components/admin/cities/CityForm'

async function getActiveRoutes() {
  const supabase = createAdminClient()
  
  const { data: routes } = await supabase
    .from('routes')
    .select('id, name')
    .eq('is_active', true)
    .order('display_order', { ascending: true, nullsFirst: false })

  return routes || []
}

export default async function NewCityPage() {
  const routes = await getActiveRoutes()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Nueva Ciudad"
          description="Agregar una ciudad a una ruta de cobertura"
        />
        
        <CityForm routes={routes} />
      </div>
    </DashboardLayout>
  )
}
