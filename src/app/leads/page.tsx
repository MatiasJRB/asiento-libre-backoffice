import { DashboardLayout } from '@/components/dashboard-layout'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
        <div>
          <h2 className="text-3xl font-bold text-neutral-900">Leads</h2>
          <p className="text-neutral-600 mt-1">Gestión de leads de la landing page</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">
                Total Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">
                Suscritos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{subscribedLeads}</div>
              <p className="text-xs text-neutral-600 mt-1">
                {totalLeads > 0 ? Math.round((subscribedLeads / totalLeads) * 100) : 0}% del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">
                Emails de Bienvenida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{welcomeEmailsSent}</div>
              <p className="text-xs text-neutral-600 mt-1">
                {totalLeads > 0 ? Math.round((welcomeEmailsSent / totalLeads) * 100) : 0}% enviados
              </p>
            </CardContent>
          </Card>
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
