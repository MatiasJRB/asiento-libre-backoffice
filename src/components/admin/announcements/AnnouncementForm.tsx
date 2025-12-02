'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createAnnouncement, updateAnnouncement } from '@/lib/actions/announcements'
import type { CommunityAnnouncement } from '@/lib/types/announcements'
import type { AnnouncementFormData } from '@/lib/validations/announcement.schema'

interface AnnouncementFormProps {
  announcement?: CommunityAnnouncement
  mode: 'create' | 'edit'
}

const typeOptions = [
  { value: 'info', label: 'Información' },
  { value: 'promo', label: 'Promoción' },
  { value: 'event', label: 'Evento' },
  { value: 'alert', label: 'Alerta' },
  { value: 'tip', label: 'Consejo' }
]

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'archived', label: 'Archivado' }
]

const ctaActionOptions = [
  { value: 'none', label: 'Sin acción' },
  { value: 'navigate', label: 'Navegar (pantalla de app)' },
  { value: 'link', label: 'Abrir enlace' },
  { value: 'share', label: 'Compartir' }
]

export function AnnouncementForm({ announcement, mode }: AnnouncementFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: announcement?.title || '',
    description: announcement?.description || '',
    type: announcement?.type || 'info',
    status: announcement?.status || 'draft',
    display_order: announcement?.display_order || 0,
    starts_at: announcement?.starts_at || null,
    ends_at: announcement?.ends_at || null,
    icon: announcement?.icon || 'megaphone',
    icon_color: announcement?.icon_color || '#3B82F6',
    badge_label: announcement?.badge_label || '',
    cta_text: announcement?.cta_text || null,
    cta_action: announcement?.cta_action || 'none',
    cta_target: announcement?.cta_target || null,
    target_audience: announcement?.target_audience || 'both'
  })

  const updateField = <K extends keyof AnnouncementFormData>(
    field: K,
    value: AnnouncementFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const result = mode === 'create'
      ? await createAnnouncement(formData)
      : await updateAnnouncement(announcement!.id, formData)

    if (result.success) {
      router.push('/admin/announcements')
      router.refresh()
    } else {
      setError(result.error || 'Error al guardar')
      setIsSubmitting(false)
    }
  }

  const showCTAFields = formData.cta_action && formData.cta_action !== 'none'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Formulario */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === 'create' ? 'Nuevo Anuncio' : 'Editar Anuncio'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Título */}
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  maxLength={100}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/100 caracteres
                </p>
              </div>

              {/* Descripción */}
              <div>
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  maxLength={300}
                  rows={3}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/300 caracteres
                </p>
              </div>

              {/* Tipo */}
              <div>
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => updateField('type', value as AnnouncementFormData['type'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estado */}
              <div>
                <Label htmlFor="status">Estado *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateField('status', value as AnnouncementFormData['status'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Audiencia objetivo */}
              <div>
                <Label htmlFor="target_audience">Audiencia objetivo *</Label>
                <Select
                  value={formData.target_audience}
                  onValueChange={(value) => updateField('target_audience', value as AnnouncementFormData['target_audience'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Ambos (App + Landing)</SelectItem>
                    <SelectItem value="app">Solo App Móvil</SelectItem>
                    <SelectItem value="landing">Solo Landing</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Define dónde se mostrará este anuncio
                </p>
              </div>

              {/* Orden de visualización */}
              <div>
                <Label htmlFor="display_order">Orden de visualización</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => updateField('display_order', parseInt(e.target.value) || 0)}
                  min={0}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Menor número = mayor prioridad
                </p>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="starts_at">Fecha de inicio</Label>
                  <Input
                    id="starts_at"
                    type="datetime-local"
                    value={formData.starts_at?.slice(0, 16) || ''}
                    onChange={(e) => updateField('starts_at', e.target.value || null)}
                  />
                </div>
                <div>
                  <Label htmlFor="ends_at">Fecha de fin</Label>
                  <Input
                    id="ends_at"
                    type="datetime-local"
                    value={formData.ends_at?.slice(0, 16) || ''}
                    onChange={(e) => updateField('ends_at', e.target.value || null)}
                  />
                </div>
              </div>

              {/* Icono y Color */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icon">
                    Icono (Ionicons) *
                    <a 
                      href="https://ionic.io/ionicons" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 text-xs ml-2"
                    >
                      Ver iconos
                    </a>
                  </Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => updateField('icon', e.target.value)}
                    placeholder="ej: megaphone, gift, calendar"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="icon_color">Color del icono *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="icon_color"
                      type="color"
                      value={formData.icon_color}
                      onChange={(e) => updateField('icon_color', e.target.value)}
                      className="w-16 h-10"
                      required
                    />
                    <Input
                      type="text"
                      value={formData.icon_color}
                      onChange={(e) => updateField('icon_color', e.target.value)}
                      placeholder="#3B82F6"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Badge Label */}
              <div>
                <Label htmlFor="badge_label">Etiqueta (opcional)</Label>
                <Input
                  id="badge_label"
                  value={formData.badge_label}
                  onChange={(e) => updateField('badge_label', e.target.value)}
                  maxLength={20}
                  placeholder="ej: NUEVO, HOY, -30%"
                />
              </div>

              {/* CTA Action */}
              <div>
                <Label htmlFor="cta_action">Acción del botón</Label>
                <Select
                  value={formData.cta_action || 'none'}
                  onValueChange={(value) => updateField('cta_action', value as AnnouncementFormData['cta_action'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ctaActionOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* CTA Text y Target (solo si hay acción) */}
              {showCTAFields && (
                <>
                  <div>
                    <Label htmlFor="cta_text">Texto del botón *</Label>
                    <Input
                      id="cta_text"
                      value={formData.cta_text || ''}
                      onChange={(e) => updateField('cta_text', e.target.value || null)}
                      maxLength={30}
                      placeholder="ej: Ver más, Participar"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cta_target">Objetivo *</Label>
                    <Input
                      id="cta_target"
                      value={formData.cta_target || ''}
                      onChange={(e) => updateField('cta_target', e.target.value || null)}
                      maxLength={200}
                      placeholder="ej: RideDetail, https://ejemplo.com"
                      required
                    />
                  </div>
                </>
              )}

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Guardar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <div>
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Previsualización Móvil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg">
              {/* Simulación de la tarjeta móvil */}
              <div className="bg-white rounded-2xl p-4 shadow-md max-w-sm mx-auto">
                {/* Badge si existe */}
                {formData.badge_label && (
                  <div className="mb-2">
                    <span className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {formData.badge_label}
                    </span>
                  </div>
                )}

                {/* Contenido principal */}
                <div className="flex gap-3">
                  {/* Icono */}
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: formData.icon_color }}
                  >
                    <span className="text-white text-xs font-mono">
                      {formData.icon.slice(0, 3).toUpperCase()}
                    </span>
                  </div>

                  {/* Texto */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm mb-1">
                      {formData.title || 'Título del anuncio'}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {formData.description || 'Descripción del anuncio aparecerá aquí...'}
                    </p>

                    {/* Botón CTA */}
                    {showCTAFields && formData.cta_text && (
                      <button 
                        className="mt-3 px-4 py-2 bg-blue-500 text-white text-xs font-medium rounded-full"
                        disabled
                      >
                        {formData.cta_text}
                      </button>
                    )}
                  </div>
                </div>

                {/* Información de vigencia */}
                {(formData.starts_at || formData.ends_at) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      {formData.starts_at && `Desde: ${new Date(formData.starts_at).toLocaleDateString('es-AR')}`}
                      {formData.starts_at && formData.ends_at && ' • '}
                      {formData.ends_at && `Hasta: ${new Date(formData.ends_at).toLocaleDateString('es-AR')}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Ayuda */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Así se verá en la app móvil
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
