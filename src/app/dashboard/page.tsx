import { DashboardLayout } from '@/components/dashboard-layout'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Vista general de la plataforma</p>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-green-600 mt-1">
                +{stats.newUsersThisMonth} este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Viajes este Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ridesThisMonth}</div>
              <p className="text-xs text-gray-600 mt-1">
                {stats.completedRidesThisMonth} completados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tasa Conversión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-gray-600 mt-1">
                Viajes completados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Rating Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.platformAvgRating}/5</div>
              <p className="text-xs text-gray-600 mt-1">
                Calificación plataforma
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Métricas Secundarias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Viajes Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRides}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Reportes Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.pendingReports}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Leads este Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.leadsThisMonth}</div>
              <p className="text-xs text-gray-600 mt-1">
                Total: {stats.totalLeads}
              </p>
            </CardContent>
          </Card>
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
                  <p className="text-sm text-gray-500">No hay usuarios recientes</p>
                ) : (
                  activity.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{user.full_name || 'Sin nombre'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        user.email_verif_status === 'verified'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {user.email_verif_status === 'verified' ? 'Verificado' : 'Pendiente'}
                      </span>
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
                  <p className="text-sm text-gray-500">No hay reportes recientes</p>
                ) : (
                  activity.recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium capitalize">{report.type.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(report.created_at).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          report.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          report.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          report.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {report.severity}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          report.status === 'investigating' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {report.status}
                        </span>
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
