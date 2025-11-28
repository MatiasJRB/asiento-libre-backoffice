import { DashboardLayout } from '@/components/dashboard-layout'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { KPICard } from '@/components/ui/kpi-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Mail, UserCheck, Send } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getLeads() {
  const supabase = createAdminClient()
  
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching leads:', error)
    return []
  }

  return leads || []
}

export default async function LeadsPage() {
  const leads = await getLeads()
  
  const totalLeads = leads.length
  const subscribedLeads = leads.filter(l => l.is_subscribed).length
  const welcomeEmailsSent = leads.filter(l => l.welcome_email_sent).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Leads"
          description="Gestión de leads de la landing page"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            title="Total Leads"
            value={totalLeads}
            icon={Mail}
          />

          <KPICard
            title="Suscritos"
            value={subscribedLeads}
            subtitle={`${totalLeads > 0 ? Math.round((subscribedLeads / totalLeads) * 100) : 0}% del total`}
            icon={UserCheck}
            variant="default"
          />

          <KPICard
            title="Emails Enviados"
            value={welcomeEmailsSent}
            subtitle={`${totalLeads > 0 ? Math.round((welcomeEmailsSent / totalLeads) * 100) : 0}% enviados`}
            icon={Send}
          />
        </div>

        {/* Tabla de Leads */}
        <Card>
          <CardHeader>
            <CardTitle>Todos los Leads ({totalLeads})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Nombre</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Email Status</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Bienvenida</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Source</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-neutral-500">
                        No hay leads registrados
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr key={lead.id} className="border-b hover:bg-neutral-50">
                        <td className="py-3 px-4">
                          <p className="font-medium">{lead.email}</p>
                        </td>
                        <td className="py-3 px-4 text-sm">{lead.name || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded ${
                            lead.is_subscribed
                              ? 'bg-success-light text-success-dark'
                              : 'bg-error-light text-error-dark'
                          }`}>
                            {lead.is_subscribed ? 'Suscrito' : 'No suscrito'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded ${
                            lead.email_status === 'delivered' ? 'bg-success-light text-success-dark' :
                            lead.email_status === 'sent' ? 'bg-primary-light text-primary-dark' :
                            lead.email_status === 'bounced' ? 'bg-error-light text-error-dark' :
                            'bg-neutral-100 text-neutral-700'
                          }`}>
                            {lead.email_status || 'pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded ${
                            lead.welcome_email_sent
                              ? 'bg-success-light text-success-dark'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}>
                            {lead.welcome_email_sent ? 'Enviado' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{lead.source || '-'}</td>
                        <td className="py-3 px-4 text-sm text-neutral-600">
                          {new Date(lead.created_at).toLocaleDateString('es-AR')}
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
