import { DashboardLayout } from '@/components/dashboard-layout'
import { getAllAnnouncements } from '@/lib/actions/announcements'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { AnnouncementActions } from '@/components/admin/announcements/AnnouncementActions'

export const dynamic = 'force-dynamic'

const typeLabels: Record<string, string> = {
  info: 'Información',
  promo: 'Promoción',
  event: 'Evento',
  alert: 'Alerta',
  tip: 'Consejo'
}

const typeColors: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700 border-blue-300',
  promo: 'bg-purple-100 text-purple-700 border-purple-300',
  event: 'bg-green-100 text-green-700 border-green-300',
  alert: 'bg-red-100 text-red-700 border-red-300',
  tip: 'bg-yellow-100 text-yellow-700 border-yellow-300'
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-300',
  draft: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  inactive: 'bg-gray-100 text-gray-700 border-gray-300',
  archived: 'bg-red-100 text-red-700 border-red-300'
}

const statusLabels: Record<string, string> = {
  active: 'Activo',
  draft: 'Borrador',
  inactive: 'Inactivo',
  archived: 'Archivado'
}

function formatDateRange(starts_at: string | null, ends_at: string | null): string {
  if (!starts_at && !ends_at) return 'Sin fechas definidas'
  
  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  
  if (starts_at && ends_at) {
    return `${formatDate(starts_at)} - ${formatDate(ends_at)}`
  }
  
  if (starts_at) return `Desde ${formatDate(starts_at)}`
  if (ends_at) return `Hasta ${formatDate(ends_at)}`
  
  return 'Sin fechas definidas'
}

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>
}) {
  const params = await searchParams
  const result = await getAllAnnouncements({
    status: params.status,
    type: params.type
  })

  if (!result.success || !result.data) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeader
            title="Anuncios de Comunidad"
            description="Gestión de anuncios para la app móvil"
          />
          <Card>
            <CardContent className="p-6">
              <p className="text-red-600">Error al cargar anuncios: {result.error}</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const announcements = result.data

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Anuncios de Comunidad"
          description="Gestión de anuncios para CommunityInfoCard en la app móvil"
        />

        {/* Filtros rápidos */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 mr-2">Estado:</span>
          <Link href="/admin/announcements">
            <Button variant={!params.status ? 'default' : 'outline'} size="sm">
              Todos
            </Button>
          </Link>
          <Link href="/admin/announcements?status=active">
            <Button variant={params.status === 'active' ? 'default' : 'outline'} size="sm">
              Activos
            </Button>
          </Link>
          <Link href="/admin/announcements?status=draft">
            <Button variant={params.status === 'draft' ? 'default' : 'outline'} size="sm">
              Borradores
            </Button>
          </Link>
          <Link href="/admin/announcements?status=inactive">
            <Button variant={params.status === 'inactive' ? 'default' : 'outline'} size="sm">
              Inactivos
            </Button>
          </Link>
          
          <span className="text-sm text-gray-600 ml-4 mr-2">Tipo:</span>
          {Object.keys(typeLabels).map(type => (
            <Link key={type} href={`/admin/announcements?type=${type}`}>
              <Button 
                variant={params.type === type ? 'default' : 'outline'} 
                size="sm"
              >
                {typeLabels[type]}
              </Button>
            </Link>
          ))}
        </div>

        {/* Botón crear */}
        <div className="flex justify-end">
          <Link href="/admin/announcements/new">
            <Button>+ Nuevo Anuncio</Button>
          </Link>
        </div>

        {/* Tabla */}
        <Card>
          <CardHeader>
            <CardTitle>
              Anuncios ({announcements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <EmptyState
                title="No hay anuncios"
                description="Crea tu primer anuncio para comenzar"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left text-sm text-gray-600">
                      <th className="pb-3 font-medium w-16">Orden</th>
                      <th className="pb-3 font-medium">Estado</th>
                      <th className="pb-3 font-medium">Título</th>
                      <th className="pb-3 font-medium">Tipo</th>
                      <th className="pb-3 font-medium">Vigencia</th>
                      <th className="pb-3 font-medium">CTA</th>
                      <th className="pb-3 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {announcements.map((announcement) => (
                      <tr key={announcement.id} className="hover:bg-gray-50">
                        <td className="py-4">
                          <span className="text-sm font-mono text-gray-600">
                            {announcement.display_order}
                          </span>
                        </td>
                        <td className="py-4">
                          <Badge className={statusColors[announcement.status]}>
                            {statusLabels[announcement.status]}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                              style={{ backgroundColor: announcement.icon_color }}
                            >
                              {announcement.icon.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{announcement.title}</div>
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {announcement.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge className={typeColors[announcement.type]}>
                            {typeLabels[announcement.type]}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <div className="text-sm text-gray-600">
                            {formatDateRange(announcement.starts_at, announcement.ends_at)}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="text-xs text-gray-500">
                            {announcement.cta_action && announcement.cta_action !== 'none' ? (
                              <Badge variant="outline">{announcement.cta_text || 'Sin texto'}</Badge>
                            ) : (
                              <span className="text-gray-400">Sin CTA</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4">
                          <AnnouncementActions announcement={announcement} />
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
