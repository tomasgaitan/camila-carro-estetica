import { createClient } from '@/lib/supabase/server'
import ReportesClient from './reportes-client'

export default async function ReportesPage() {
  const supabase = await createClient()

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0]

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]

  const { data: paymentsRaw } = await supabase
    .from('payments')
    .select('total, method, subtotal, discount_value, paid_at, appointment:appointments(date)')
    .gte('paid_at', `${startOfMonth}T00:00:00`)
    .lte('paid_at', `${endOfMonth}T23:59:59`)
    .order('paid_at', { ascending: false })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payments = (paymentsRaw ?? []) as any[]

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6 pt-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-charcoal)]">Reportes</h1>
        <p className="text-sm text-[var(--color-charcoal-muted)] mt-0.5 capitalize">
          {today.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <ReportesClient
        payments={payments}
        todayStr={todayStr}
        startOfWeekStr={startOfWeekStr}
        startOfMonthStr={startOfMonth}
      />
    </div>
  )
}
