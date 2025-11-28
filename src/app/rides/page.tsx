import { DashboardLayout } from '@/components/dashboard-layout'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { KPICard } from '@/components/ui/kpi-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Car, CheckCircle, XCircle, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getRides(status?: string) {
  const supabase = createAdminClient()
  
  let query = supabase
    .from('rides')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: rides, error } = await query.limit(100)

  if (error) {
    console.error('Error fetching rides:', error)
    return []
  }

  if (!rides || rides.length === 0) return []

  // Obtener IDs únicos de conductores
  const driverIds = Array.from(new Set(rides.map(r => r.driver_id).filter(Boolean)))

  // Obtener datos de conductores
  const { data: drivers } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', driverIds)

  const driverMap = new Map(drivers?.map(d => [d.id, d]) || [])

  // Combinar datos
  return rides.map(r => ({
    ...r,
    driver: r.driver_id ? driverMap.get(r.driver_id) : null
  }))
}

export default async function RidesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const rides = await getRides(params.status)

  const totalRides = rides.length
  const activeRides = rides.filter(r => r.status === 'active').length
  const completedRides = rides.filter(r => r.status === 'completed').length
  const cancelledRides = rides.filter(r => r.status === 'cancelled').length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Viajes"
          description="Gestión de viajes publicados en la plataforma"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard
            title="Total Viajes"
            value={totalRides}
            icon={Car}
          />

          <KPICard
            title="Activos"
            value={activeRides}
            icon={Activity}
            variant="default"
          />

          <KPICard
            title="Completados"
            value={completedRides}
            icon={CheckCircle}
            variant="default"
          />

          <KPICard
            title="Cancelados"
            value={cancelledRides}
            icon={XCircle}
            variant="default"
          />
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtrar por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Link href="/rides">
                <Button variant={!params.status || params.status === 'all' ? 'default' : 'outline'}>
                  Todos
                </Button>
              </Link>
              <Link href="/rides?status=active">
                <Button variant={params.status === 'active' ? 'default' : 'outline'}>
                  Activos
                </Button>
              </Link>
              <Link href="/rides?status=completed">
                <Button variant={params.status === 'completed' ? 'default' : 'outline'}>
                  Completados
                </Button>
              </Link>
              <Link href="/rides?status=cancelled">
                <Button variant={params.status === 'cancelled' ? 'default' : 'outline'}>
                  Cancelados
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Viajes */}
        <Card>
          <CardHeader>
            <CardTitle>Viajes ({totalRides})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Ruta</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Conductor</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Fecha/Hora</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Asientos</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Precio</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Creado</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-neutral-500">
                        No se encontraron viajes
                      </td>
                    </tr>
                  ) : (
                    rides.map((ride) => (
                      <tr key={ride.id} className="border-b hover:bg-neutral-50">
                        <td className="py-3 px-4">
                          <Link href={`/rides/${ride.id}`} className="hover:underline">
                            <div>
                              <p className="font-medium text-sm text-primary">{ride.origin_text}</p>
                              <p className="text-xs text-neutral-500">→ {ride.dest_text}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/users/${ride.driver_id}`}
                            className="text-primary hover:underline text-sm"
                          >
                            {ride.driver?.full_name || 'Sin nombre'}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div>
                            <p>{new Date(ride.date_utc).toLocaleDateString('es-AR')}</p>
                            <p className="text-xs text-neutral-500">{ride.time_str}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {ride.seats}/{ride.seats_offered}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">
                          ${ride.price_suggested || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={
                            ride.status === 'completed' ? 'completed' :
                            ride.status === 'active' ? 'active' :
                            'cancelled'
                          }>
                            {ride.status}
                          </StatusBadge>
                        </td>
                        <td className="py-3 px-4 text-sm text-neutral-600">
                          {new Date(ride.created_at).toLocaleDateString('es-AR')}
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/rides/${ride.id}`}
                            className="text-primary hover:text-primary-dark text-sm font-medium"
                          >
                            Ver Detalle
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
