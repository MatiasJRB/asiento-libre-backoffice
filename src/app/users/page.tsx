import { DashboardLayout } from '@/components/dashboard-layout'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { Users as UsersIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getUsers(searchQuery?: string) {
  const supabase = createAdminClient()
  
  // Primero obtenemos los perfiles
  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (searchQuery) {
    query = query.or(`full_name.ilike.%${searchQuery}%,id.eq.${searchQuery}`)
  }

  const { data: profiles, error: profilesError } = await query.limit(100)

  if (profilesError) {
    console.error('Error fetching users:', profilesError)
    return []
  }

  if (!profiles || profiles.length === 0) {
    return []
  }

  // Luego obtenemos los emails de auth.users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error('Error fetching auth users:', authError)
    // Retornamos los perfiles sin email
    return profiles.map(p => ({ ...p, email: null }))
  }

  // Combinamos los datos
  const emailMap = new Map(authUsers.users.map(u => [u.id, u.email]))
  
  return profiles.map(profile => ({
    ...profile,
    email: emailMap.get(profile.id) || null
  }))
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const users = await getUsers(params.search)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Usuarios"
          description="Gestión de usuarios de la plataforma"
        />

        {/* Buscador */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <form method="get" className="flex gap-2">
              <Input
                type="text"
                name="search"
                placeholder="Buscar por nombre o ID..."
                defaultValue={params.search}
                className="flex-1"
              />
              <Button type="submit">
                Buscar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tabla de Usuarios */}
        <Card>
          <CardHeader>
            <CardTitle>Todos los Usuarios ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Usuario</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Ciudad</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Verificación</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Rol</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Registro</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-neutral-500">
                        No se encontraron usuarios
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-neutral-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{user.full_name || 'Sin nombre'}</p>
                            <p className="text-xs text-neutral-500 truncate max-w-[200px]">
                              {user.id}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{user.city || '-'}</td>
                        <td className="py-3 px-4 text-sm">
                          {user.avg_rating > 0 ? (
                            <span>
                              ⭐ {user.avg_rating.toFixed(1)} ({user.ratings_count})
                            </span>
                          ) : (
                            <span className="text-neutral-400">Sin ratings</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={user.email_verif_status === 'verified' ? 'verified' : 'pending'}>
                            {user.email_verif_status === 'verified' ? 'Verificado' : 'Pendiente'}
                          </StatusBadge>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'super_admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                            user.role === 'admin' ? 'bg-primary-light text-primary-dark border border-primary' :
                            'bg-neutral-100 text-neutral-700 border border-neutral-200'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={user.suspended ? 'suspended' : 'active'}>
                            {user.suspended ? 'Suspendido' : 'Activo'}
                          </StatusBadge>
                        </td>
                        <td className="py-3 px-4 text-sm text-neutral-600">
                          {new Date(user.created_at).toLocaleDateString('es-AR')}
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/users/${user.id}`}
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
