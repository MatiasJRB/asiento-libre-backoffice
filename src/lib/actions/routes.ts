'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { checkUserRole } from '@/lib/auth/check-role'
import { revalidatePath } from 'next/cache'
import { routeSchema, type RouteFormData } from '@/lib/validations/route.schema'

// Helper para generar slug desde nombre
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createRoute(
  data: RouteFormData
): Promise<{ success: boolean; error?: string; id?: string }> {
  const { isAdmin, userId: adminId } = await checkUserRole()

  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  // Validar datos
  const validation = routeSchema.safeParse(data)
  if (!validation.success) {
    return { 
      success: false, 
      error: validation.error.issues[0].message 
    }
  }

  const supabase = createAdminClient()

  // Generar slug único
  const baseSlug = generateSlug(data.name)
  let slug = baseSlug
  let counter = 1

  // Verificar si ya existe
  while (true) {
    const { data: existing } = await supabase
      .from('routes')
      .select('id')
      .eq('id', slug)
      .single()

    if (!existing) break
    slug = `${baseSlug}-${counter}`
    counter++
  }

  const { data: route, error } = await supabase
    .from('routes')
    .insert({
      id: slug,
      name: data.name,
      description: data.description,
      display_order: data.display_order ?? 999,
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
    action_type: 'create_route',
    target_type: 'route',
    target_id: route.id,
    details: { name: data.name },
  })

  revalidatePath('/admin/routes')

  return { success: true, id: route.id }
}

export async function updateRoute(
  id: string,
  data: RouteFormData
): Promise<{ success: boolean; error?: string }> {
  const { isAdmin, userId: adminId } = await checkUserRole()

  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  // Validar datos
  const validation = routeSchema.safeParse(data)
  if (!validation.success) {
    return { 
      success: false, 
      error: validation.error.issues[0].message 
    }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('routes')
    .update({
      name: data.name,
      description: data.description,
      display_order: data.display_order,
      is_active: data.is_active
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'update_route',
    target_type: 'route',
    target_id: id,
    details: { name: data.name },
  })

  revalidatePath('/admin/routes')
  revalidatePath(`/admin/routes/${id}`)

  return { success: true }
}

export async function toggleRouteStatus(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const { isAdmin, userId: adminId } = await checkUserRole()

  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('routes')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: isActive ? 'activate_route' : 'deactivate_route',
    target_type: 'route',
    target_id: id,
    details: { is_active: isActive },
  })

  revalidatePath('/admin/routes')

  return { success: true }
}

export async function deleteRoute(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { isAdmin, userId: adminId } = await checkUserRole()

  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const supabase = createAdminClient()

  // Verificar si tiene ciudades asociadas
  const { count } = await supabase
    .from('coverage_cities')
    .select('*', { count: 'exact', head: true })
    .eq('route_id', id)

  if (count && count > 0) {
    return { 
      success: false, 
      error: `No se puede eliminar. Hay ${count} ciudades en esta ruta. Desactívala en su lugar.` 
    }
  }

  const { error } = await supabase
    .from('routes')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'delete_route',
    target_type: 'route',
    target_id: id,
    details: {},
  })

  revalidatePath('/admin/routes')

  return { success: true }
}
