import { DashboardLayout } from '@/components/dashboard-layout'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import type { CityWithRoute } from '@/lib/types/routes-cities'

export const dynamic = 'force-dynamic'

async function getCities(routeId?: string): Promise<CityWithRoute[]> {
  const supabase = createAdminClient()
  
  let query = supabase
    .from('coverage_cities')
    .select(`
      *,
      route:routes(id, name)
    `)
    .order('route_id', { ascending: true })
    .order('name', { ascending: true })

  if (routeId) {
    query = query.eq('route_id', routeId)
  }

  const { data: cities, error } = await query

  if (error) {
    console.error('Error fetching cities:', error)
    return []
  }

  return cities || []
}

async function getRoutes() {
  const supabase = createAdminClient()
  
  const { data: routes } = await supabase
    .from('routes')
    .select('id, name, is_active')
    .eq('is_active', true)
    .order('display_order', { ascending: true, nullsFirst: false })

  return routes || []
}

const hierarchyLabels: Record<number, string> = {
  0: 'Principal',
  1: 'Intermedia',
  2: 'Secundaria'
}

const hierarchyColors: Record<number, string> = {
  0: 'bg-red-100 text-red-700 border-red-300',
  1: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  2: 'bg-green-100 text-green-700 border-green-300'
}

export default async function CitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ route?: string }>
}) {
  const params = await searchParams
  const cities = await getCities(params.route)
  const routes = await getRoutes()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Ciudades de Cobertura"
          description="Gestión de ciudades por ruta"
        />

        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Link 
              href="/admin/cities"
              className={!params.route ? 'font-bold' : ''}
            >
              <Button variant={!params.route ? 'default' : 'outline'} size="sm">
                Todas
              </Button>
            </Link>
            {routes.map((route) => (
              <Link 
                key={route.id} 
                href={`/admin/cities?route=${route.id}`}
                className={params.route === route.id.toString() ? 'font-bold' : ''}
              >
                <Button 
                  variant={params.route === route.id.toString() ? 'default' : 'outline'} 
                  size="sm"
                >
                  {route.name}
                </Button>
              </Link>
            ))}
          </div>
          <Link href="/admin/cities/new">
            <Button>+ Nueva Ciudad</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {params.route 
                ? `Ciudades de ${routes.find(r => r.id.toString() === params.route)?.name || 'Ruta'}`
                : `Todas las Ciudades (${cities.length})`
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cities.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                No hay ciudades registradas
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Ciudad</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Ruta</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Coordenadas</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Jerarquía</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cities.map((city) => (
                      <tr key={city.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-3 px-4 font-medium">
                          {city.name}
                        </td>
                        <td className="py-3 px-4">
                          <Link 
                            href={`/admin/cities?route=${city.route_id}`}
                            className="text-primary-dark hover:underline"
                          >
                            {city.route?.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm text-neutral-600">
                          {city.lat?.toFixed(4) || 'N/A'}, {city.lng?.toFixed(4) || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs border ${hierarchyColors[city.hierarchy] || ''}`}>
                            {hierarchyLabels[city.hierarchy] || city.hierarchy}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {city.is_active ? (
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
                          <Link href={`/admin/cities/${city.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Editar
                            </Button>
                          </Link>
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
