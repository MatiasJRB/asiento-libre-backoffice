'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCity } from '@/lib/actions/cities'
import type { CityFormData } from '@/lib/validations/city.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Route {
  id: string
  name: string
}

interface CityFormProps {
  routes: Route[]
}

const hierarchyOptions = [
  { value: 0, label: 'Principal (0) - Ciudades grandes, puntos clave' },
  { value: 1, label: 'Intermedia (1) - Ciudades medianas, paradas frecuentes' },
  { value: 2, label: 'Secundaria (2) - Pueblos pequeños, paradas opcionales' }
]

export function CityForm({ routes }: CityFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CityFormData>({
    route_id: '',
    name: '',
    lat: 0,
    lng: 0,
    hierarchy: 1,
    is_active: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.route_id) {
      setError('Debe seleccionar una ruta')
      setLoading(false)
      return
    }

    const result = await createCity(formData)

    if (result.success) {
      router.push('/admin/cities')
      router.refresh()
    } else {
      setError(result.error || 'Error al crear la ciudad')
      setLoading(false)
    }
  }

  return (
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
                value={formData.lat || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  lat: parseFloat(e.target.value) || 0 
                })}
                required
              />
              <p className="text-xs text-neutral-500 mt-1">Entre -90 y 90</p>
            </div>

            <div>
              <Label htmlFor="lng">Longitud *</Label>
              <Input
                id="lng"
                type="number"
                step="0.0001"
                placeholder="-62.2663"
                value={formData.lng || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  lng: parseFloat(e.target.value) || 0 
                })}
                required
              />
              <p className="text-xs text-neutral-500 mt-1">Entre -180 y 180</p>
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
              checked={formData.is_active}
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
              {loading ? 'Guardando...' : 'Crear Ciudad'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
