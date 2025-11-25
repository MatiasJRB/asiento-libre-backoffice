import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/types/database'

export async function checkUserRole(): Promise<{ 
  isAdmin: boolean
  role: UserRole | null
  userId: string | null
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { isAdmin: false, role: null, userId: null }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { isAdmin: false, role: null, userId: user.id }
    }

    const isAdmin = profile.role === 'admin' || profile.role === 'super_admin'
    
    return { 
      isAdmin, 
      role: profile.role as UserRole,
      userId: user.id 
    }
  } catch (error) {
    console.error('Error checking user role:', error)
    return { isAdmin: false, role: null, userId: null }
  }
}
