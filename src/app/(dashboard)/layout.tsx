import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MobileNav from '@/components/nav/mobile-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--color-background)]">
      <MobileNav />
      <main className="flex-1 px-4 pt-4 pb-28">
        {children}
      </main>
    </div>
  )
}
