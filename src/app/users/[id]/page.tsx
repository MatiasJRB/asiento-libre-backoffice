import { DashboardLayout } from '@/components/dashboard-layout'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkUserRole } from '@/lib/auth/check-role'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { UserActions } from '@/components/user-actions'

async function getUserDetails(userId: string) {
  const supabase = createAdminClient()
  
  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    return null
  }

  // Get auth user email
  const { data: authUser } = await supabase.auth.admin.getUserById(userId)

  // Get vehicles
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .eq('user_id', userId)

  // Get rides as driver
  const { data: ridesAsDriver } = await supabase
    .from('rides')
    .select('*')
    .eq('driver_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get ride requests as passenger
  const { data: ridesAsPassenger } = await supabase
    .from('ride_requests')
    .select('*')
    .eq('passenger_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get rides data for passenger requests
  const rideIds = Array.from(new Set(ridesAsPassenger?.map(r => r.ride_id).filter(Boolean) || []))
  const { data: ridesData } = await supabase
    .from('rides')
    .select('*')
    .in('id', rideIds)

  const ridesMap = new Map(ridesData?.map(r => [r.id, r]) || [])

  const ridesAsPassengerWithRides = ridesAsPassenger?.map(r => ({
    ...r,
    ride: r.ride_id ? ridesMap.get(r.ride_id) : null
  })) || []

  // Get ratings received
  const { data: ratingsReceived } = await supabase
    .from('ratings')
    .select('*')
    .eq('ratee_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get rater names for ratings
  const raterIds = Array.from(new Set(ratingsReceived?.map(r => r.rater_id).filter(Boolean) || []))
  const { data: raters } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', raterIds)

  const raterMap = new Map(raters?.map(r => [r.id, r]) || [])

  const ratingsWithRaters = ratingsReceived?.map(r => ({
    ...r,
    rater: r.rater_id ? raterMap.get(r.rater_id) : null
  })) || []

  return {
    profile,
    email: authUser?.user?.email || null,
    vehicles: vehicles || [],
    ridesAsDriver: ridesAsDriver || [],
    ridesAsPassenger: ridesAsPassengerWithRides,
    ratingsReceived: ratingsWithRaters,
  }
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const userDetails = await getUserDetails(id)
  const { role: adminRole } = await checkUserRole()

  if (!userDetails) {
    notFound()
  }

  const { profile, email, vehicles, ridesAsDriver, ridesAsPassenger, ratingsReceived } = userDetails

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{profile.full_name || 'Sin nombre'}</h2>
            <p className="text-gray-600 mt-1">{email}</p>
          </div>
          <div className="flex gap-2">
            <UserActions 
              userId={id} 
              currentRole={profile.role} 
              isSuspended={profile.suspended}
              userRole={adminRole || undefined}
            />
            <Link
              href="/users"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Volver
            </Link>
          </div>
        </div>

        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Ciudad:</span>{' '}
                <span className="font-medium">{profile.city || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600">Género:</span>{' '}
                <span className="font-medium">{profile.gender || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600">Fecha de nacimiento:</span>{' '}
                <span className="font-medium">
                  {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('es-AR') : '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Verificación:</span>{' '}
                <span className={`px-2 py-1 rounded text-xs ${
                  profile.email_verif_status === 'verified'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {profile.email_verif_status === 'verified' ? 'Verificado' : 'Pendiente'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Rol:</span>{' '}
                <span className={`px-2 py-1 rounded text-xs ${
                  profile.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                  profile.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {profile.role}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Rating promedio:</span>{' '}
                <span className="font-medium">
                  {profile.avg_rating > 0 ? `⭐ ${profile.avg_rating.toFixed(1)}` : 'Sin ratings'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total calificaciones:</span>{' '}
                <span className="font-medium">{profile.ratings_count}</span>
              </div>
              <div>
                <span className="text-gray-600">Viajes publicados:</span>{' '}
                <span className="font-medium">{ridesAsDriver.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Solicitudes de viaje:</span>{' '}
                <span className="font-medium">{ridesAsPassenger.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Vehículos registrados:</span>{' '}
                <span className="font-medium">{vehicles.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado de Cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Estado:</span>{' '}
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  profile.suspended
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {profile.suspended ? 'Suspendido' : 'Activo'}
                </span>
              </div>
              {profile.suspended && (
                <>
                  <div>
                    <span className="text-gray-600">Fecha de suspensión:</span>{' '}
                    <span className="font-medium">
                      {profile.suspended_at ? new Date(profile.suspended_at).toLocaleDateString('es-AR') : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Razón:</span>{' '}
                    <p className="text-gray-900 mt-1">{profile.suspended_reason || '-'}</p>
                  </div>
                </>
              )}
              <div>
                <span className="text-gray-600">Registrado:</span>{' '}
                <span className="font-medium">
                  {new Date(profile.created_at).toLocaleDateString('es-AR')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bio */}
        {profile.bio && (
          <Card>
            <CardHeader>
              <CardTitle>Biografía</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Vehicles */}
        {vehicles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Vehículos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="border-b pb-2">
                    <p className="font-medium">
                      {vehicle.make} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''}
                    </p>
                    <p className="text-sm text-gray-600">
                      Color: {vehicle.color || '-'} • Patente: {vehicle.plate || vehicle.license_plate || '-'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Ratings */}
        {ratingsReceived.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Calificaciones Recibidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ratingsReceived.map((rating) => (
                  <div key={rating.id} className="border-b pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {'⭐'.repeat(rating.stars)} ({rating.stars}/5)
                        </p>
                        <p className="text-sm text-gray-600">
                          Por: {rating.rater?.full_name || 'Usuario desconocido'}
                        </p>
                        {rating.comment && (
                          <p className="text-sm text-gray-700 mt-1">&ldquo;{rating.comment}&rdquo;</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(rating.created_at).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Rides as Driver */}
        {ridesAsDriver.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Últimos Viajes Publicados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ridesAsDriver.map((ride) => (
                  <div key={ride.id} className="border-b pb-2">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{ride.origin_text} → {ride.dest_text}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(ride.date_utc).toLocaleDateString('es-AR')} • {ride.time_str}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded h-fit ${
                        ride.status === 'completed' ? 'bg-green-100 text-green-700' :
                        ride.status === 'active' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {ride.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
