import { redirect } from 'next/navigation'
import { checkUserRole } from '@/lib/auth/check-role'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { isAdmin } = await checkUserRole()
  
  if (!isAdmin) {
    redirect('/login')
  }
  
  redirect('/dashboard')
}
