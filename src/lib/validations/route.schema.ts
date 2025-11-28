import { z } from 'zod'

export const routeSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .nullable(),
  display_order: z.number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden debe ser mayor o igual a 0'),
  is_active: z.boolean().default(true)
})

export type RouteFormData = z.infer<typeof routeSchema>
