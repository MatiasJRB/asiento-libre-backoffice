'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRoute } from '@/lib/actions/routes'
import type { RouteFormData } from '@/lib/validations/route.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function RouteForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<RouteFormData>({
    name: '',
    description: '',
    display_order: 0,
    is_active: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createRoute(formData)

    if (result.success) {
      router.push('/admin/routes')
      router.refresh()
    } else {
      setError(result.error || 'Error al crear la ruta')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Información de la Ruta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="name">Nombre de la Ruta *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ej: Ruta 3 Sur"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Ej: Buenos Aires → Bahía Blanca → Comodoro Rivadavia"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="display_order">Orden de visualización</Label>
            <Input
              id="display_order"
              type="number"
              placeholder="1"
              min="0"
              value={formData.display_order ?? ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                display_order: e.target.value ? parseInt(e.target.value) : 0 
              })}
            />
            <p className="text-sm text-neutral-500 mt-1">
              Define el orden en que aparece en la app móvil
            </p>
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
              Ruta activa (visible en la app)
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
              {loading ? 'Guardando...' : 'Crear Ruta'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
