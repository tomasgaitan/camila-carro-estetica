import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CalendarPlus } from '@phosphor-icons/react/dist/ssr'
import type { Appointment } from '@/types'
import AgendaCalendar from './agenda-calendar'

export default async function AgendaPage() {
  const supabase = await createClient()

  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, client:clients(name), appointment_services(service_name)')
    .gte('date', startOfMonth)
    .lte('date', endOfMonth)
    .order('date')
    .order('start_time')

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6 pt-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-charcoal)]">Agenda</h1>
          <p className="text-sm text-[var(--color-charcoal-muted)] mt-0.5 capitalize">
            {today.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link
          href="/turnos/nuevo"
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.97]"
        >
          <CalendarPlus size={16} weight="light" />
          Nuevo
        </Link>
      </div>

      <AgendaCalendar
        appointments={(appointments as Appointment[]) ?? []}
        currentMonth={today.toISOString().split('T')[0].slice(0, 7)}
      />
    </div>
  )
}
