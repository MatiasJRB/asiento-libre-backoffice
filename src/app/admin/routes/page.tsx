import { DashboardLayout } from '@/components/dashboard-layout'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import type { RouteWithCityCount } from '@/lib/types/routes-cities'

export const dynamic = 'force-dynamic'

async function getRoutes(): Promise<RouteWithCityCount[]> {
  const supabase = createAdminClient()
  
  const { data: routes, error } = await supabase
    .from('routes')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching routes:', error)
    return []
  }

  if (!routes) return []

  // Transformar datos para incluir conteo
  const routesWithCount = await Promise.all(
    routes.map(async (route) => {
      const { count: cityCount } = await supabase
        .from('coverage_cities')
        .select('*', { count: 'exact', head: true })
        .eq('route_id', route.id)

      const { count: activeCities } = await supabase
        .from('coverage_cities')
        .select('*', { count: 'exact', head: true })
        .eq('route_id', route.id)
        .eq('is_active', true)

      return {
        ...route,
        city_count: cityCount || 0,
        active_cities: activeCities || 0
      }
    })
  )

  return routesWithCount
}

export default async function RoutesPage() {
  const routes = await getRoutes()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Rutas"
          description="Gestión de rutas de cobertura"
        />

        <div className="flex justify-end">
          <Link href="/admin/routes/new">
            <Button>+ Nueva Ruta</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todas las Rutas ({routes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {routes.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                No hay rutas registradas
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Nombre</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Descripción</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Ciudades</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Orden</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map((route) => (
                      <tr key={route.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-3 px-4">
                          <Link 
                            href={`/admin/routes/${route.id}`}
                            className="font-medium text-primary-dark hover:underline"
                          >
                            {route.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-neutral-600 max-w-xs truncate">
                          {route.description || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <Link 
                            href={`/admin/cities?route=${route.id}`}
                            className="text-primary-dark hover:underline"
                          >
                            📍 {route.active_cities}/{route.city_count}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-neutral-600">
                          {route.display_order ?? '-'}
                        </td>
                        <td className="py-3 px-4">
                          {route.is_active ? (
                            <StatusBadge status="active">
                              Activa
                            </StatusBadge>
                          ) : (
                            <StatusBadge status="cancelled">
                              Inactiva
                            </StatusBadge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Link href={`/admin/routes/${route.id}/edit`}>
                              <Button variant="outline" size="sm">
                                Editar
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
