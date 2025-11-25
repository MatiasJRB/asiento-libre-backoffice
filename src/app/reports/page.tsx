import { DashboardLayout } from '@/components/dashboard-layout'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

async function getReports(status?: string, severity?: string, type?: string) {
  const supabase = createAdminClient()
  
  let query = supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (severity && severity !== 'all') {
    query = query.eq('severity', severity)
  }

  if (type && type !== 'all') {
    query = query.eq('type', type)
  }

  const { data: reports, error } = await query.limit(100)

  if (error) {
    console.error('Error fetching reports:', error)
    return []
  }

  if (!reports || reports.length === 0) return []

  // Obtener IDs únicos de usuarios
  const userIds = new Set<string>()
  reports.forEach(r => {
    if (r.reporter_id) userIds.add(r.reporter_id)
    if (r.reported_user_id) userIds.add(r.reported_user_id)
  })

  // Obtener datos de usuarios
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', Array.from(userIds))

  const userMap = new Map(users?.map(u => [u.id, u]) || [])

  // Combinar datos
  return reports.map(r => ({
    ...r,
    reporter: r.reporter_id ? userMap.get(r.reporter_id) : null,
    reported_user: r.reported_user_id ? userMap.get(r.reported_user_id) : null
  }))
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; severity?: string; type?: string }>
}) {
  const params = await searchParams
  const reports = await getReports(params.status, params.severity, params.type)

  const totalReports = reports.length
  const pendingReports = reports.filter(r => r.status === 'pending').length
  const criticalReports = reports.filter(r => r.severity === 'critical').length
  const resolvedReports = reports.filter(r => r.status === 'resolved').length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900">Reportes</h2>
          <p className="text-neutral-600 mt-1">Gestión de reportes y denuncias</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">
                Total Reportes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReports}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">
                Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingReports}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">
                Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-error">{criticalReports}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">
                Resueltos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{resolvedReports}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-2">Estado</p>
                <div className="flex gap-2 flex-wrap">
                  <Link
                    href="/reports"
                    className={`px-4 py-2 rounded-md font-medium text-sm ${
                      !params.status || params.status === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Todos
                  </Link>
                  <Link
                    href="/reports?status=pending"
                    className={`px-4 py-2 rounded-md font-medium text-sm ${
                      params.status === 'pending'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Pendientes
                  </Link>
                  <Link
                    href="/reports?status=investigating"
                    className={`px-4 py-2 rounded-md font-medium text-sm ${
                      params.status === 'investigating'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Investigando
                  </Link>
                  <Link
                    href="/reports?status=resolved"
                    className={`px-4 py-2 rounded-md font-medium text-sm ${
                      params.status === 'resolved'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Resueltos
                  </Link>
                  <Link
                    href="/reports?status=dismissed"
                    className={`px-4 py-2 rounded-md font-medium text-sm ${
                      params.status === 'dismissed'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Descartados
                  </Link>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-700 mb-2">Severidad</p>
                <div className="flex gap-2 flex-wrap">
                  <Link
                    href="/reports"
                    className={`px-4 py-2 rounded-md font-medium text-sm ${
                      !params.severity || params.severity === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Todas
                  </Link>
                  <Link
                    href="/reports?severity=critical"
                    className={`px-4 py-2 rounded-md font-medium text-sm ${
                      params.severity === 'critical'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Crítica
                  </Link>
                  <Link
                    href="/reports?severity=high"
                    className={`px-4 py-2 rounded-md font-medium text-sm ${
                      params.severity === 'high'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Alta
                  </Link>
                  <Link
                    href="/reports?severity=medium"
                    className={`px-4 py-2 rounded-md font-medium text-sm ${
                      params.severity === 'medium'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Media
                  </Link>
                  <Link
                    href="/reports?severity=low"
                    className={`px-4 py-2 rounded-md font-medium text-sm ${
                      params.severity === 'low'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Baja
                  </Link>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-700 mb-2">Tipo</p>
                <div className="flex gap-2 flex-wrap">
                  <Link
                    href="/reports"
                    className={`px-3 py-2 rounded-md text-sm ${
                      !params.type || params.type === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Todos
                  </Link>
                  <Link
                    href="/reports?type=fraud"
                    className={`px-3 py-2 rounded-md text-sm ${
                      params.type === 'fraud'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Fraude
                  </Link>
                  <Link
                    href="/reports?type=harassment"
                    className={`px-3 py-2 rounded-md text-sm ${
                      params.type === 'harassment'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Acoso
                  </Link>
                  <Link
                    href="/reports?type=no_show"
                    className={`px-3 py-2 rounded-md text-sm ${
                      params.type === 'no_show'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    No Show
                  </Link>
                  <Link
                    href="/reports?type=unsafe_driving"
                    className={`px-3 py-2 rounded-md text-sm ${
                      params.type === 'unsafe_driving'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Conducción Insegura
                  </Link>
                  <Link
                    href="/reports?type=price_gouging"
                    className={`px-3 py-2 rounded-md text-sm ${
                      params.type === 'price_gouging'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Cobro Excesivo
                  </Link>
                  <Link
                    href="/reports?type=inappropriate_content"
                    className={`px-3 py-2 rounded-md text-sm ${
                      params.type === 'inappropriate_content'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Contenido Inapropiado
                  </Link>
                  <Link
                    href="/reports?type=other"
                    className={`px-3 py-2 rounded-md text-sm ${
                      params.type === 'other'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Otro
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Reportes */}
        <Card>
          <CardHeader>
            <CardTitle>Reportes ({totalReports})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Reportado</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Reportante</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Severidad</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-neutral-500">
                        No se encontraron reportes
                      </td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr key={report.id} className="border-b hover:bg-neutral-50">
                        <td className="py-3 px-4">
                          <Link
                            href={`/reports/${report.id}`}
                            className="text-sm font-medium capitalize text-primary hover:underline"
                          >
                            {report.type.replace('_', ' ')}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          {report.reported_user_id ? (
                            <Link
                              href={`/users/${report.reported_user_id}`}
                              className="text-primary hover:underline text-sm"
                            >
                              {report.reported_user?.full_name || 'Usuario'}
                            </Link>
                          ) : (
                            <span className="text-neutral-500 text-sm">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {report.reporter_id ? (
                            <Link
                              href={`/users/${report.reporter_id}`}
                              className="text-primary hover:underline text-sm"
                            >
                              {report.reporter?.full_name || 'Usuario'}
                            </Link>
                          ) : (
                            <span className="text-neutral-500 text-sm">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded ${
                            report.severity === 'critical' ? 'bg-error-light text-error-dark' :
                            report.severity === 'high' ? 'bg-warning-light text-warning-dark' :
                            report.severity === 'medium' ? 'bg-warning-light text-warning-dark' :
                            'bg-neutral-100 text-neutral-700'
                          }`}>
                            {report.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded ${
                            report.status === 'resolved' ? 'bg-success-light text-success-dark' :
                            report.status === 'investigating' ? 'bg-primary-light text-primary-dark' :
                            report.status === 'dismissed' ? 'bg-neutral-100 text-neutral-700' :
                            'bg-warning-light text-warning-dark'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-neutral-600">
                          {new Date(report.created_at).toLocaleDateString('es-AR')}
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/reports/${report.id}`}
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
