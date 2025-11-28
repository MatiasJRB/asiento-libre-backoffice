import { DashboardLayout } from '@/components/dashboard-layout'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KPICard } from '@/components/ui/kpi-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { PageHeader } from '@/components/ui/page-header'
import { Users, Car, TrendingUp, Star, Activity, AlertCircle, Mail } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getStats() {
  const supabase = createAdminClient()
  
  // Total usuarios
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Usuarios este mes
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const { count: newUsersThisMonth } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString())

  // Viajes totales
  const { count: totalRides } = await supabase
    .from('rides')
    .select('*', { count: 'exact', head: true })

  // Viajes este mes
  const { count: ridesThisMonth } = await supabase
    .from('rides')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString())

  // Viajes completados este mes
  const { count: completedRidesThisMonth } = await supabase
    .from('rides')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('created_at', startOfMonth.toISOString())

  // Viajes activos
  const { count: activeRides } = await supabase
    .from('rides')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Reportes pendientes
  const { count: pendingReports } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Rating promedio
  const { data: avgRatingData } = await supabase
    .from('profiles')
    .select('avg_rating, ratings_count')
    .gt('ratings_count', 0)

  let platformAvgRating = 0
  if (avgRatingData && avgRatingData.length > 0) {
    const totalRating = avgRatingData.reduce((sum, p) => sum + (p.avg_rating * p.ratings_count), 0)
    const totalRatings = avgRatingData.reduce((sum, p) => sum + p.ratings_count, 0)
    platformAvgRating = totalRatings > 0 ? totalRating / totalRatings : 0
  }

  // Leads totales
  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })

  // Leads este mes
  const { count: leadsThisMonth } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString())

  // Tasa de conversión
  const conversionRate = ridesThisMonth && completedRidesThisMonth 
    ? (completedRidesThisMonth / ridesThisMonth) * 100 
    : 0

  return {
    totalUsers: totalUsers || 0,
    newUsersThisMonth: newUsersThisMonth || 0,
    totalRides: totalRides || 0,
    ridesThisMonth: ridesThisMonth || 0,
    completedRidesThisMonth: completedRidesThisMonth || 0,
    activeRides: activeRides || 0,
    pendingReports: pendingReports || 0,
    platformAvgRating: platformAvgRating.toFixed(1),
    totalLeads: totalLeads || 0,
    leadsThisMonth: leadsThisMonth || 0,
    conversionRate: conversionRate.toFixed(1),
  }
}

async function getRecentActivity() {
  const supabase = createAdminClient()
  
  // Últimos usuarios registrados
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, full_name, email_verif_status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  // Últimos viajes
  const { data: recentRides } = await supabase
    .from('rides')
    .select(`
      id,
      origin_text,
      dest_text,
      status,
      created_at,
      driver:profiles!rides_driver_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Reportes recientes
  const { data: recentReports } = await supabase
    .from('reports')
    .select('id, type, severity, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    recentUsers: recentUsers || [],
    recentRides: recentRides || [],
    recentReports: recentReports || [],
  }
}

export default async function DashboardPage() {
  const stats = await getStats()
  const activity = await getRecentActivity()

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          title="Dashboard"
          description="Vista general de la plataforma"
        />

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Usuarios"
            value={stats.totalUsers.toLocaleString()}
            subtitle="este mes"
            icon={Users}
            trend={{
              value: stats.newUsersThisMonth,
              isPositive: stats.newUsersThisMonth > 0
            }}
          />

          <KPICard
            title="Viajes este Mes"
            value={stats.ridesThisMonth}
            subtitle={`${stats.completedRidesThisMonth} completados`}
            icon={Car}
            variant="default"
          />

          <KPICard
            title="Tasa Conversión"
            value={`${stats.conversionRate}%`}
            subtitle="viajes completados"
            icon={TrendingUp}
            variant="default"
          />

          <KPICard
            title="Rating Promedio"
            value={`${stats.platformAvgRating}/5`}
            subtitle="calificación plataforma"
            icon={Star}
            variant="default"
          />
        </div>

        {/* Métricas Secundarias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            title="Viajes Activos"
            value={stats.activeRides}
            icon={Activity}
            variant="default"
          />

          <KPICard
            title="Reportes Pendientes"
            value={stats.pendingReports}
            icon={AlertCircle}
            variant="default"
          />

          <KPICard
            title="Leads este Mes"
            value={stats.leadsThisMonth}
            subtitle={`Total: ${stats.totalLeads}`}
            icon={Mail}
          />
        </div>

        {/* Actividad Reciente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usuarios Recientes */}
          <Card>
            <CardHeader>
              <CardTitle>Usuarios Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activity.recentUsers.length === 0 ? (
                  <p className="text-sm text-neutral-500">No hay usuarios recientes</p>
                ) : (
                  activity.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{user.full_name || 'Sin nombre'}</p>
                        <p className="text-xs text-neutral-500">
                          {new Date(user.created_at).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                      <StatusBadge 
                        status={user.email_verif_status === 'verified' ? 'verified' : 'pending'}
                        dot={false}
                      >
                        {user.email_verif_status === 'verified' ? 'Verificado' : 'Pendiente'}
                      </StatusBadge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reportes Recientes */}
          <Card>
            <CardHeader>
              <CardTitle>Reportes Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activity.recentReports.length === 0 ? (
                  <p className="text-sm text-neutral-500">No hay reportes recientes</p>
                ) : (
                  activity.recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium capitalize">{report.type.replace('_', ' ')}</p>
                        <p className="text-xs text-neutral-500">
                          {new Date(report.created_at).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <StatusBadge 
                          status={
                            report.severity === 'critical' || report.severity === 'high' ? 'suspended' :
                            report.severity === 'medium' ? 'pending' :
                            'active'
                          }
                          dot={false}
                        >
                          {report.severity}
                        </StatusBadge>
                        <StatusBadge 
                          status={
                            report.status === 'resolved' ? 'completed' :
                            report.status === 'investigating' ? 'active' :
                            'pending'
                          }
                          dot={false}
                        >
                          {report.status}
                        </StatusBadge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
