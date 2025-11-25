import { DashboardLayout } from '@/components/dashboard-layout'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900">Usuarios</h2>
            <p className="text-neutral-600 mt-1">Gestión de usuarios de la plataforma</p>
          </div>
        </div>

        {/* Buscador */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <form method="get" className="flex gap-2">
              <input
                type="text"
                name="search"
                placeholder="Buscar por nombre o ID..."
                defaultValue={params.search}
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-medium"
              >
                Buscar
              </button>
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
                          <span className={`text-xs px-2 py-1 rounded ${
                            user.email_verif_status === 'verified'
                              ? 'bg-success-light text-success-dark'
                              : 'bg-warning-light text-warning-dark'
                          }`}>
                            {user.email_verif_status === 'verified' ? 'Verificado' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded ${
                            user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'admin' ? 'bg-primary-light text-primary-dark' :
                            'bg-neutral-100 text-neutral-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded ${
                            user.suspended
                              ? 'bg-error-light text-error-dark'
                              : 'bg-success-light text-success-dark'
                          }`}>
                            {user.suspended ? 'Suspendido' : 'Activo'}
                          </span>
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
