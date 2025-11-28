import { z } from 'zod'

export const citySchema = z.object({
  route_id: z.string()
    .min(1, 'Debe seleccionar una ruta'),
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  lat: z.number()
    .min(-90, 'La latitud debe estar entre -90 y 90')
    .max(90, 'La latitud debe estar entre -90 y 90'),
  lng: z.number()
    .min(-180, 'La longitud debe estar entre -180 y 180')
    .max(180, 'La longitud debe estar entre -180 y 180'),
  hierarchy: z.number()
    .int('La jerarquía debe ser un número entero')
    .min(0, 'La jerarquía mínima es 0 (Principal)')
    .max(2, 'La jerarquía máxima es 2 (Secundaria)')
    .nullable()
    .default(1),
  is_active: z.boolean().nullable().default(true)
})

export type CityFormData = z.infer<typeof citySchema>
