import { DashboardLayout } from '@/components/dashboard-layout'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ReportActions } from '@/components/report-actions'

async function getReportDetails(reportId: string) {
  const supabase = createAdminClient()
  
  const { data: report, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (error || !report) {
    return null
  }

  // Obtener datos relacionados
  const [reporterData, reportedUserData, rideData] = await Promise.all([
    report.reporter_id ? supabase.from('profiles').select('id, full_name, avatar_url').eq('id', report.reporter_id).single() : Promise.resolve({ data: null }),
    report.reported_user_id ? supabase.from('profiles').select('id, full_name, avatar_url, suspended').eq('id', report.reported_user_id).single() : Promise.resolve({ data: null }),
    report.ride_id ? supabase.from('rides').select('id, origin_text, dest_text, date_utc, status').eq('id', report.ride_id).single() : Promise.resolve({ data: null })
  ])

  return {
    ...report,
    reporter: reporterData.data,
    reported_user: reportedUserData.data,
    ride: rideData.data
  }
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const report = await getReportDetails(id)

  if (!report) {
    notFound()
  }

  const severityColors = {
    low: 'bg-yellow-100 text-yellow-700',
    medium: 'bg-orange-100 text-orange-700',
    high: 'bg-red-100 text-red-700',
  }

  const statusColors = {
    pending: 'bg-gray-100 text-gray-700',
    investigating: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
    dismissed: 'bg-gray-100 text-gray-600',
  }

  const statusLabels = {
    pending: 'Pendiente',
    investigating: 'En investigación',
    resolved: 'Resuelto',
    dismissed: 'Descartado',
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Detalle del Reporte</h2>
            <p className="text-gray-600 mt-1">
              #{report.id.slice(0, 8)}
            </p>
          </div>
          <div className="flex gap-2">
            <ReportActions reportId={id} currentStatus={report.status} />
            <Link
              href="/reports"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Volver
            </Link>
          </div>
        </div>

        {/* Report Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Reporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Tipo:</span>{' '}
                <span className="font-medium">{report.type}</span>
              </div>
              <div>
                <span className="text-gray-600">Severidad:</span>{' '}
                <span className={`px-2 py-1 rounded text-xs ${severityColors[report.severity as keyof typeof severityColors]}`}>
                  {report.severity}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Estado:</span>{' '}
                <span className={`px-2 py-1 rounded text-xs ${statusColors[report.status as keyof typeof statusColors]}`}>
                  {statusLabels[report.status as keyof typeof statusLabels]}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Fecha:</span>{' '}
                <span className="font-medium">
                  {new Date(report.created_at).toLocaleString('es-AR')}
                </span>
              </div>
              {report.resolved_at && (
                <div>
                  <span className="text-gray-600">Resuelto:</span>{' '}
                  <span className="font-medium">
                    {new Date(report.resolved_at).toLocaleString('es-AR')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reportado por</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Link
                href={`/users/${report.reporter_id}`}
                className="text-blue-600 hover:underline font-medium block"
              >
                {report.reporter?.full_name || 'Usuario'}
              </Link>
              <p className="text-xs text-gray-500">ID: {report.reporter_id.slice(0, 8)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usuario Reportado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Link
                href={`/users/${report.reported_user_id}`}
                className="text-blue-600 hover:underline font-medium block"
              >
                {report.reported_user?.full_name || 'Usuario'}
              </Link>
              <p className="text-xs text-gray-500">ID: {report.reported_user_id.slice(0, 8)}</p>
              {report.reported_user?.suspended && (
                <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                  Suspendido
                </span>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Report Description */}
        <Card>
          <CardHeader>
            <CardTitle>Descripción del Reporte</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900 whitespace-pre-wrap">{report.description}</p>
          </CardContent>
        </Card>

        {/* Evidence */}
        {report.evidence_urls && report.evidence_urls.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Evidencia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.evidence_urls.map((url: string, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded border">
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {url}
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Ride */}
        {report.ride && (
          <Card>
            <CardHeader>
              <CardTitle>Viaje Relacionado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Link
                href={`/rides/${report.ride_id}`}
                className="text-blue-600 hover:underline font-medium block"
              >
                {report.ride.origin_text} → {report.ride.dest_text}
              </Link>
              <div>
                <span className="text-gray-600">Fecha:</span>{' '}
                <span className="font-medium">
                  {new Date(report.ride.date_utc).toLocaleDateString('es-AR')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Estado del viaje:</span>{' '}
                <span className={`px-2 py-1 rounded text-xs ${
                  report.ride.status === 'completed' ? 'bg-green-100 text-green-700' :
                  report.ride.status === 'active' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {report.ride.status}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Notes */}
        {report.admin_notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notas del Administrador</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 whitespace-pre-wrap">{report.admin_notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
