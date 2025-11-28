'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCity, deleteCity, toggleCityStatus } from '@/lib/actions/cities'
import type { CityFormData } from '@/lib/validations/city.schema'
import type { CoverageCity } from '@/lib/types/routes-cities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Route {
  id: string
  name: string
}

interface CityEditFormProps {
  city: CoverageCity
  routes: Route[]
}

const hierarchyOptions = [
  { value: 0, label: 'Principal (0) - Ciudades grandes, puntos clave' },
  { value: 1, label: 'Intermedia (1) - Ciudades medianas, paradas frecuentes' },
  { value: 2, label: 'Secundaria (2) - Pueblos pequeños, paradas opcionales' }
]

export function CityEditForm({ city, routes }: CityEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CityFormData>({
    route_id: city.route_id,
    name: city.name,
    lat: city.lat,
    lng: city.lng,
    hierarchy: city.hierarchy,
    is_active: city.is_active
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await updateCity(city.id, formData)

    if (result.success) {
      router.push('/admin/cities')
      router.refresh()
    } else {
      setError(result.error || 'Error al actualizar la ciudad')
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!confirm(`¿${formData.is_active ? 'Desactivar' : 'Activar'} esta ciudad?`)) return

    setLoading(true)
    const newStatus = !formData.is_active
    const result = await toggleCityStatus(city.id, newStatus)

    if (result.success) {
      setFormData({ ...formData, is_active: newStatus })
      router.refresh()
    } else {
      alert(result.error)
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta ciudad? Esta acción no se puede deshacer.')) return

    setLoading(true)
    const result = await deleteCity(city.id)

    if (result.success) {
      router.push('/admin/cities')
      router.refresh()
    } else {
      alert(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información de la Ciudad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="route_id">Ruta *</Label>
              <Select
                value={formData.route_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, route_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ruta..." />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id.toString()}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name">Nombre de la Ciudad *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ej: Bahía Blanca"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lat">Latitud *</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.0001"
                  placeholder="-38.7183"
                  value={formData.lat}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    lat: parseFloat(e.target.value) || 0 
                  })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="lng">Longitud *</Label>
                <Input
                  id="lng"
                  type="number"
                  step="0.0001"
                  placeholder="-62.2663"
                  value={formData.lng}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    lng: parseFloat(e.target.value) || 0 
                  })}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Jerarquía *</Label>
              <div className="space-y-2 mt-2">
                {hierarchyOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hierarchy"
                      value={option.value}
                      checked={formData.hierarchy === option.value}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        hierarchy: parseInt(e.target.value) 
                      })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is_active"
                type="checkbox"
                checked={formData.is_active ?? true}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Ciudad activa (visible en la app)
              </Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Actualizar Ciudad'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Button
              variant="outline"
              onClick={handleToggleStatus}
              disabled={loading}
              className="w-full"
            >
              {formData.is_active ? 'Desactivar Ciudad' : 'Activar Ciudad'}
            </Button>
          </div>
          <div>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={loading}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Eliminar Ciudad
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
