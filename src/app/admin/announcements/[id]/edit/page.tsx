import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/ui/page-header'
import { AnnouncementForm } from '@/components/admin/announcements/AnnouncementForm'
import { getAnnouncementById } from '@/lib/actions/announcements'
import { Card, CardContent } from '@/components/ui/card'
import { redirect } from 'next/navigation'

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getAnnouncementById(id)

  if (!result.success || !result.data) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeader
            title="Error"
            description="No se pudo cargar el anuncio"
          />
          <Card>
            <CardContent className="p-6">
              <p className="text-red-600">{result.error || 'Anuncio no encontrado'}</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Editar Anuncio"
          description={`Editando: ${result.data.title}`}
        />
        
        <AnnouncementForm mode="edit" announcement={result.data} />
      </div>
    </DashboardLayout>
  )
}
