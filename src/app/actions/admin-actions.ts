'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { checkUserRole } from '@/lib/auth/check-role'
import { revalidatePath } from 'next/cache'

export async function suspendUser(
  userId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const { isAdmin, userId: adminId } = await checkUserRole()

  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      suspended: true,
      suspended_at: new Date().toISOString(),
      suspended_reason: reason,
      suspended_by: adminId,
    })
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'suspend_user',
    target_type: 'user',
    target_id: userId,
    details: { reason },
  })

  revalidatePath(`/users/${userId}`)
  revalidatePath('/users')

  return { success: true }
}

export async function unsuspendUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const { isAdmin, userId: adminId } = await checkUserRole()

  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      suspended: false,
      suspended_at: null,
      suspended_reason: null,
      suspended_by: null,
    })
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'unsuspend_user',
    target_type: 'user',
    target_id: userId,
    details: {},
  })

  revalidatePath(`/users/${userId}`)
  revalidatePath('/users')

  return { success: true }
}

export async function changeUserRole(
  userId: string,
  newRole: 'user' | 'admin' | 'super_admin'
): Promise<{ success: boolean; error?: string }> {
  const { isAdmin, userId: adminId, role } = await checkUserRole()

  if (!isAdmin || role !== 'super_admin') {
    return { success: false, error: 'Solo super_admin puede cambiar roles' }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'change_user_role',
    target_type: 'user',
    target_id: userId,
    details: { new_role: newRole },
  })

  revalidatePath(`/users/${userId}`)
  revalidatePath('/users')

  return { success: true }
}

export async function cancelRide(
  rideId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const { isAdmin, userId: adminId } = await checkUserRole()

  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('rides')
    .update({ 
      status: 'cancelled',
      auto_close_reason: `Admin: ${reason}`
    })
    .eq('id', rideId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'cancel_ride',
    target_type: 'ride',
    target_id: rideId,
    details: { reason },
  })

  revalidatePath(`/rides/${rideId}`)
  revalidatePath('/rides')

  return { success: true }
}

export async function updateReportStatus(
  reportId: string,
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed',
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  const { isAdmin, userId: adminId } = await checkUserRole()

  if (!isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  const supabase = createAdminClient()

  const updateData: {
    status: string
    assigned_admin_id: string | null
    admin_notes?: string
    resolved_at?: string
  } = {
    status,
    assigned_admin_id: adminId,
  }

  if (adminNotes) {
    updateData.admin_notes = adminNotes
  }

  if (status === 'resolved' || status === 'dismissed') {
    updateData.resolved_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('reports')
    .update(updateData)
    .eq('id', reportId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'update_report_status',
    target_type: 'report',
    target_id: reportId,
    details: { status, admin_notes: adminNotes },
  })

  revalidatePath(`/reports/${reportId}`)
  revalidatePath('/reports')

  return { success: true }
}
