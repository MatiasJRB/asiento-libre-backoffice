import { z } from 'zod'

export const announcementSchema = z.object({
  title: z.string()
    .min(1, 'El título es obligatorio')
    .max(100, 'El título no puede exceder 100 caracteres'),
  
  description: z.string()
    .min(1, 'La descripción es obligatoria')
    .max(300, 'La descripción no puede exceder 300 caracteres'),
  
  type: z.enum(['info', 'promo', 'event', 'alert', 'tip'], {
    message: 'Debe seleccionar un tipo válido'
  }),
  
  status: z.enum(['draft', 'active', 'inactive', 'archived'], {
    message: 'Debe seleccionar un estado válido'
  }),
  
  display_order: z.number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden mínimo es 0')
    .default(0),
  
  starts_at: z.string().nullable().optional(),
  
  ends_at: z.string().nullable().optional(),
  
  icon: z.string()
    .min(1, 'El icono es obligatorio')
    .max(50, 'El nombre del icono no puede exceder 50 caracteres'),
  
  icon_color: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Debe ser un color hexadecimal válido (ej: #FF5733)'),
  
  badge_label: z.string()
    .max(20, 'La etiqueta no puede exceder 20 caracteres')
    .default(''),
  
  cta_text: z.string()
    .max(30, 'El texto del botón no puede exceder 30 caracteres')
    .nullable()
    .optional(),
  
  cta_action: z.enum(['none', 'navigate', 'link', 'share'], {
    message: 'Debe seleccionar una acción válida'
  }).nullable().optional(),
  
  cta_target: z.string()
    .max(200, 'El objetivo no puede exceder 200 caracteres')
    .nullable()
    .optional()
}).refine((data) => {
  // Validar que ends_at sea posterior a starts_at si ambos existen
  if (data.starts_at && data.ends_at) {
    return new Date(data.ends_at) > new Date(data.starts_at)
  }
  return true
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['ends_at']
}).refine((data) => {
  // Si cta_action no es 'none', cta_text y cta_target son obligatorios
  if (data.cta_action && data.cta_action !== 'none') {
    return !!data.cta_text && !!data.cta_target
  }
  return true
}, {
  message: 'El texto y objetivo del CTA son obligatorios cuando se selecciona una acción',
  path: ['cta_text']
})

export type AnnouncementFormData = z.infer<typeof announcementSchema>
