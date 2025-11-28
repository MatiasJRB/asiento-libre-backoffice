import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/ui/page-header'
import { RouteForm } from '@/components/admin/routes/RouteForm'

export default function NewRoutePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Nueva Ruta"
          description="Crear una nueva ruta de cobertura"
        />
        
        <RouteForm />
      </div>
    </DashboardLayout>
  )
}
