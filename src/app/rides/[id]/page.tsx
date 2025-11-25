import { DashboardLayout } from '@/components/dashboard-layout'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { RideActions } from '@/components/ride-actions'

async function getRideDetails(rideId: string) {
  const supabase = createAdminClient()
  
  // Get ride
  const { data: ride, error: rideError } = await supabase
    .from('rides')
    .select('*')
    .eq('id', rideId)
    .single()

  if (rideError || !ride) {
    return null
  }

  // Get related data in parallel
  const [driverData, vehicleData, requestsData, messagesData] = await Promise.all([
    supabase.from('profiles').select('id, full_name, avatar_url, avg_rating, ratings_count').eq('id', ride.driver_id).single(),
    ride.vehicle_id ? supabase.from('vehicles').select('make, model, color, plate, year').eq('id', ride.vehicle_id).single() : Promise.resolve({ data: null }),
    supabase.from('ride_requests').select('*').eq('ride_id', rideId).order('created_at', { ascending: false }),
    supabase.from('messages').select('*').eq('ride_id', rideId).order('created_at', { ascending: true })
  ])

  // Get passenger IDs from requests
  const passengerIds = Array.from(new Set(requestsData.data?.map(r => r.passenger_id).filter(Boolean) || []))
  
  // Get passengers data
  const { data: passengers } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, avg_rating')
    .in('id', passengerIds)

  const passengerMap = new Map(passengers?.map(p => [p.id, p]) || [])

  // Get message author IDs
  const authorIds = Array.from(new Set(messagesData.data?.map(m => m.author_id).filter(Boolean) || []))
  
  // Get authors data
  const { data: authors } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', authorIds)

  const authorMap = new Map(authors?.map(a => [a.id, a]) || [])

  return {
    ride: {
      ...ride,
      driver: driverData.data,
      vehicle: vehicleData.data
    },
    requests: requestsData.data?.map(r => ({
      ...r,
      passenger: r.passenger_id ? passengerMap.get(r.passenger_id) : null
    })) || [],
    messages: messagesData.data?.map(m => ({
      ...m,
      author: m.author_id ? authorMap.get(m.author_id) : null
    })) || [],
  }
}

export default async function RideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const rideDetails = await getRideDetails(id)

  if (!rideDetails) {
    notFound()
  }

  const { ride, requests, messages } = rideDetails
  const acceptedPassengers = requests.filter(r => r.status === 'accepted')
  const pendingRequests = requests.filter(r => r.status === 'pending')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Detalle del Viaje</h2>
            <p className="text-gray-600 mt-1">
              {ride.origin_text} → {ride.dest_text}
            </p>
          </div>
          <div className="flex gap-2">
            <RideActions rideId={id} currentStatus={ride.status} />
            <Link
              href="/rides"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Volver
            </Link>
          </div>
        </div>

        {/* Ride Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Viaje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Fecha:</span>{' '}
                <span className="font-medium">
                  {new Date(ride.date_utc).toLocaleDateString('es-AR')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Hora de salida:</span>{' '}
                <span className="font-medium">{ride.time_str}</span>
              </div>
              {ride.estimated_arrival_str && (
                <div>
                  <span className="text-gray-600">Llegada estimada:</span>{' '}
                  <span className="font-medium">{ride.estimated_arrival_str}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Precio sugerido:</span>{' '}
                <span className="font-medium">${ride.price_suggested || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600">Asientos:</span>{' '}
                <span className="font-medium">{ride.seats} ocupados / {ride.seats_offered} ofrecidos</span>
              </div>
              <div>
                <span className="text-gray-600">Estado:</span>{' '}
                <span className={`px-2 py-1 rounded text-xs ${
                  ride.status === 'completed' ? 'bg-green-100 text-green-700' :
                  ride.status === 'active' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {ride.status}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conductor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Link
                href={`/users/${ride.driver.id}`}
                className="text-blue-600 hover:underline font-medium"
              >
                {ride.driver.full_name || 'Sin nombre'}
              </Link>
              <div>
                <span className="text-gray-600">Rating:</span>{' '}
                <span className="font-medium">
                  {ride.driver.avg_rating > 0 
                    ? `⭐ ${ride.driver.avg_rating.toFixed(1)} (${ride.driver.ratings_count})` 
                    : 'Sin ratings'}
                </span>
              </div>
              {ride.vehicle && (
                <>
                  <div className="pt-2 border-t">
                    <p className="font-medium">
                      {ride.vehicle.make} {ride.vehicle.model}
                    </p>
                    {ride.vehicle.year && (
                      <p className="text-gray-600">Año: {ride.vehicle.year}</p>
                    )}
                    {ride.vehicle.color && (
                      <p className="text-gray-600">Color: {ride.vehicle.color}</p>
                    )}
                    {ride.vehicle.plate && (
                      <p className="text-gray-600">Patente: {ride.vehicle.plate}</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferencias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Horario flexible:</span>{' '}
                <span className="font-medium">{ride.flexible ? 'Sí' : 'No'}</span>
              </div>
              <div>
                <span className="text-gray-600">Permite equipaje:</span>{' '}
                <span className="font-medium">{ride.allows_luggage ? 'Sí' : 'No'}</span>
              </div>
              <div>
                <span className="text-gray-600">Máx. 2 atrás:</span>{' '}
                <span className="font-medium">{ride.comfort_backseat_2_only ? 'Sí' : 'No'}</span>
              </div>
              {ride.prefs_text && (
                <div className="pt-2 border-t">
                  <p className="text-gray-600">Notas:</p>
                  <p className="text-gray-900">{ride.prefs_text}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Route Details */}
        <Card>
          <CardHeader>
            <CardTitle>Ruta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Origen</p>
                <p className="font-medium">{ride.origin_text}</p>
                <p className="text-xs text-gray-500">
                  {ride.origin_lat.toFixed(6)}, {ride.origin_lng.toFixed(6)}
                </p>
              </div>
              {ride.via_cities && Array.isArray(ride.via_cities) && ride.via_cities.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Ciudades intermedias</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(ride.via_cities as Array<{ name?: string; selected?: boolean }>).map((city, idx) => (
                      city.selected && (
                        <span key={idx} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                          {city.name}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Destino</p>
                <p className="font-medium">{ride.dest_text}</p>
                <p className="text-xs text-gray-500">
                  {ride.dest_lat.toFixed(6)}, {ride.dest_lng.toFixed(6)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passengers */}
        {acceptedPassengers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pasajeros Confirmados ({acceptedPassengers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {acceptedPassengers.map((request) => (
                  <div key={request.id} className="flex justify-between items-start border-b pb-3">
                    <div>
                      <Link
                        href={`/users/${request.passenger_id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {request.passenger?.full_name || 'Usuario'}
                      </Link>
                      <p className="text-sm text-gray-600">
                        {request.seats_requested} asiento{request.seats_requested > 1 ? 's' : ''}
                      </p>
                      {request.pickup_text && (
                        <p className="text-xs text-gray-500 mt-1">
                          Sube: {request.pickup_text}
                        </p>
                      )}
                      {request.dropoff_text && (
                        <p className="text-xs text-gray-500">
                          Baja: {request.dropoff_text}
                        </p>
                      )}
                      {request.message && (
                        <p className="text-sm text-gray-700 mt-1 italic">
                          &ldquo;{request.message}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {new Date(request.created_at).toLocaleDateString('es-AR')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Pendientes ({pendingRequests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex justify-between items-start border-b pb-3">
                    <div>
                      <Link
                        href={`/users/${request.passenger_id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {request.passenger?.full_name || 'Usuario'}
                      </Link>
                      <p className="text-sm text-gray-600">
                        {request.seats_requested} asiento{request.seats_requested > 1 ? 's' : ''}
                      </p>
                      {request.message && (
                        <p className="text-sm text-gray-700 mt-1 italic">
                          &ldquo;{request.message}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                      Pendiente
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Messages/Chat */}
        {messages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Chat del Viaje ({messages.length} mensajes)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message.id} className="border-b pb-2">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm">{message.author?.full_name || 'Usuario'}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleString('es-AR')}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{message.body}</p>
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
