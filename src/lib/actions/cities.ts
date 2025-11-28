'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { checkUserRole } from '@/lib/auth/check-role'
import { revalidatePath } from 'next/cache'
import { citySchema, type CityFormData } from '@/lib/validations/city.schema'

export async function createCity(
  data: CityFormData
): Promise<{ success: boolean; error?: string; id?: number }> {
  const { isAdmin, userId: adminId } = await checkUserRole()

  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  // Validar datos
  const validation = citySchema.safeParse(data)
  if (!validation.success) {
    return { 
      success: false, 
      error: validation.error.issues[0].message 
    }
  }

  const supabase = createAdminClient()

  // Verificar si ya existe una ciudad con ese nombre en la misma ruta
  const { data: existing } = await supabase
    .from('coverage_cities')
    .select('id')
    .eq('route_id', data.route_id)
    .eq('name', data.name)
    .single()

  if (existing) {
    return { success: false, error: 'Ya existe una ciudad con ese nombre en esta ruta' }
  }

  const { data: city, error } = await supabase
    .from('coverage_cities')
    .insert({
      route_id: data.route_id,
      name: data.name,
      lat: data.lat,
      lng: data.lng,
      hierarchy: data.hierarchy ?? 1,
      is_active: data.is_active ?? true
    })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'create_city',
    target_type: 'coverage_city',
    target_id: city.id.toString(),
    details: { name: data.name, route_id: data.route_id },
  })

  revalidatePath('/admin/cities')
  revalidatePath('/admin/routes')

  return { success: true, id: city.id }
}

export async function updateCity(
  id: number,
  data: CityFormData
): Promise<{ success: boolean; error?: string }> {
  const { isAdmin, userId: adminId } = await checkUserRole()

  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  // Validar datos
  const validation = citySchema.safeParse(data)
  if (!validation.success) {
    return { 
      success: false, 
      error: validation.error.issues[0].message 
    }
  }

  const supabase = createAdminClient()

  // Verificar si ya existe otra ciudad con ese nombre en la misma ruta
  const { data: existing } = await supabase
    .from('coverage_cities')
    .select('id')
    .eq('route_id', data.route_id)
    .eq('name', data.name)
    .neq('id', id)
    .single()

  if (existing) {
    return { success: false, error: 'Ya existe otra ciudad con ese nombre en esta ruta' }
  }

  const { error } = await supabase
    .from('coverage_cities')
    .update({
      route_id: data.route_id,
      name: data.name,
      lat: data.lat,
      lng: data.lng,
      hierarchy: data.hierarchy,
      is_active: data.is_active
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'update_city',
    target_type: 'coverage_city',
    target_id: id.toString(),
    details: { name: data.name, route_id: data.route_id },
  })

  revalidatePath('/admin/cities')
  revalidatePath(`/admin/cities/${id}`)
  revalidatePath('/admin/routes')

  return { success: true }
}

export async function toggleCityStatus(
  id: number,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const { isAdmin, userId: adminId } = await checkUserRole()

  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('coverage_cities')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: isActive ? 'activate_city' : 'deactivate_city',
    target_type: 'coverage_city',
    target_id: id.toString(),
    details: { is_active: isActive },
  })

  revalidatePath('/admin/cities')
  revalidatePath('/admin/routes')

  return { success: true }
}

export async function deleteCity(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const { isAdmin, userId: adminId } = await checkUserRole()

  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('coverage_cities')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'delete_city',
    target_type: 'coverage_city',
    target_id: id.toString(),
    details: {},
  })

  revalidatePath('/admin/cities')
  revalidatePath('/admin/routes')

  return { success: true }
}
