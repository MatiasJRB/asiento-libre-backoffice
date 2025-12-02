'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { checkUserRole } from '@/lib/auth/check-role'
import { revalidatePath } from 'next/cache'
import { announcementSchema, type AnnouncementFormData } from '@/lib/validations/announcement.schema'
import type { CommunityAnnouncement } from '@/lib/types/announcements'

export async function getAllAnnouncements(
  filters?: { status?: string; type?: string }
): Promise<{ success: boolean; data?: CommunityAnnouncement[]; error?: string }> {
  const { isAdmin } = await checkUserRole()

  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const supabase = createAdminClient()
  let query = supabase
    .from('community_announcements')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  const { data, error } = await query

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: data as CommunityAnnouncement[] }
}

export async function getAnnouncementById(
  id: string
): Promise<{ success: boolean; data?: CommunityAnnouncement; error?: string }> {
  const { isAdmin } = await checkUserRole()

  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('community_announcements')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: data as CommunityAnnouncement }
}

export async function createAnnouncement(
  formData: AnnouncementFormData
): Promise<{ success: boolean; error?: string; id?: string }> {
  const { isAdmin, userId: adminId } = await checkUserRole()

  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  // Validar datos
  const validation = announcementSchema.safeParse(formData)
  if (!validation.success) {
    return { 
      success: false, 
      error: validation.error.issues[0].message 
    }
  }

  const supabase = createAdminClient()

  const { data: announcement, error } = await supabase
    .from('community_announcements')
    .insert({
      title: formData.title,
      description: formData.description,
      type: formData.type,
      status: formData.status,
      display_order: formData.display_order ?? 0,
      starts_at: formData.starts_at || null,
      ends_at: formData.ends_at || null,
      icon: formData.icon,
      icon_color: formData.icon_color,
      badge_label: formData.badge_label || '',
      cta_text: formData.cta_text || null,
      cta_action: formData.cta_action || null,
      cta_target: formData.cta_target || null,
      created_by: adminId
    })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'create_announcement',
    target_type: 'community_announcement',
    target_id: announcement.id,
    details: { title: formData.title, type: formData.type },
  })

  revalidatePath('/admin/announcements')

  return { success: true, id: announcement.id }
}

export async function updateAnnouncement(
  id: string,
  formData: AnnouncementFormData
): Promise<{ success: boolean; error?: string }> {
  const { isAdmin, userId: adminId } = await checkUserRole()

  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  // Validar datos
  const validation = announcementSchema.safeParse(formData)
  if (!validation.success) {
    return { 
      success: false, 
      error: validation.error.issues[0].message 
    }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('community_announcements')
    .update({
      title: formData.title,
      description: formData.description,
      type: formData.type,
      status: formData.status,
      display_order: formData.display_order ?? 0,
      starts_at: formData.starts_at || null,
      ends_at: formData.ends_at || null,
      icon: formData.icon,
      icon_color: formData.icon_color,
      badge_label: formData.badge_label || '',
      cta_text: formData.cta_text || null,
      cta_action: formData.cta_action || null,
      cta_target: formData.cta_target || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'update_announcement',
    target_type: 'community_announcement',
    target_id: id,
    details: { title: formData.title },
  })

  revalidatePath('/admin/announcements')
  revalidatePath(`/admin/announcements/${id}/edit`)

  return { success: true }
}

export async function deleteAnnouncement(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { isAdmin, userId: adminId } = await checkUserRole()

  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const supabase = createAdminClient()

  // Obtener info antes de borrar
  const { data: announcement } = await supabase
    .from('community_announcements')
    .select('title')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('community_announcements')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'delete_announcement',
    target_type: 'community_announcement',
    target_id: id,
    details: { title: announcement?.title },
  })

  revalidatePath('/admin/announcements')

  return { success: true }
}

export async function duplicateAnnouncement(
  id: string
): Promise<{ success: boolean; error?: string; id?: string }> {
  const { isAdmin, userId: adminId } = await checkUserRole()

  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const supabase = createAdminClient()

  // Obtener el anuncio original
  const { data: original, error: fetchError } = await supabase
    .from('community_announcements')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !original) {
    return { success: false, error: 'Anuncio no encontrado' }
  }

  // Crear copia
  const { data: duplicate, error: createError } = await supabase
    .from('community_announcements')
    .insert({
      title: `${original.title} (Copia)`,
      description: original.description,
      type: original.type,
      status: 'draft', // Siempre crear como borrador
      display_order: original.display_order,
      starts_at: original.starts_at,
      ends_at: original.ends_at,
      icon: original.icon,
      icon_color: original.icon_color,
      badge_label: original.badge_label || '',
      cta_text: original.cta_text,
      cta_action: original.cta_action,
      cta_target: original.cta_target,
      created_by: adminId
    })
    .select('id')
    .single()

  if (createError) {
    return { success: false, error: createError.message }
  }

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'duplicate_announcement',
    target_type: 'community_announcement',
    target_id: duplicate.id,
    details: { original_id: id, title: original.title },
  })

  revalidatePath('/admin/announcements')

  return { success: true, id: duplicate.id }
}

export async function updateDisplayOrder(
  updates: { id: string; display_order: number }[]
): Promise<{ success: boolean; error?: string }> {
  const { isAdmin, userId: adminId } = await checkUserRole()

  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const supabase = createAdminClient()

  // Actualizar todos en batch
  const promises = updates.map(({ id, display_order }) =>
    supabase
      .from('community_announcements')
      .update({ display_order })
      .eq('id', id)
  )

  const results = await Promise.all(promises)
  const hasError = results.some(({ error }) => error)

  if (hasError) {
    return { success: false, error: 'Error al actualizar el orden' }
  }

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'reorder_announcements',
    target_type: 'community_announcement',
    target_id: null,
    details: { updates },
  })

  revalidatePath('/admin/announcements')

  return { success: true }
}
