import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/ui/page-header'
import { AnnouncementForm } from '@/components/admin/announcements/AnnouncementForm'

export default function NewAnnouncementPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Nuevo Anuncio"
          description="Crea un anuncio para la app móvil"
        />
        
        <AnnouncementForm mode="create" />
      </div>
    </DashboardLayout>
  )
}
