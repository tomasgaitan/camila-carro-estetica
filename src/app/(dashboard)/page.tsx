import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CalendarPlus } from '@phosphor-icons/react/dist/ssr'
import type { Appointment, Payment } from '@/types'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
}

function formatTime(time: string) {
  return time.slice(0, 5)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [{ data: appointments }, { data: payments }] = await Promise.all([
    supabase
      .from('appointments')
      .select('*, client:clients(name), appointment_services(*), appointment_products(*)')
      .eq('date', today)
      .order('start_time'),
    supabase
      .from('payments')
      .select('total, paid_at')
      .gte('paid_at', `${today}T00:00:00`)
      .lte('paid_at', `${today}T23:59:59`),
  ])

  const todayIncome = (payments as Payment[] | null)?.reduce((sum, p) => sum + p.total, 0) ?? 0
  const todayAppointments = (appointments as Appointment[] | null) ?? []
  const completedToday = todayAppointments.filter(a => a.status === 'completed').length
  const pendingToday = todayAppointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="max-w-lg mx-auto">
      {/* Saludo */}
      <div className="mb-6 pt-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-charcoal)]">
          {greeting}, Camila
        </h1>
        <p className="text-sm text-[var(--color-charcoal-muted)] mt-0.5 capitalize">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats del día */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-charcoal-muted)] mb-1">Turnos</p>
          <p className="text-2xl font-semibold text-[var(--color-charcoal)] font-mono">
            {todayAppointments.length}
          </p>
          <p className="text-[10px] text-[var(--color-charcoal-subtle)] mt-0.5">hoy</p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-charcoal-muted)] mb-1">Listos</p>
          <p className="text-2xl font-semibold text-[var(--color-success)] font-mono">
            {completedToday}
          </p>
          <p className="text-[10px] text-[var(--color-charcoal-subtle)] mt-0.5">completados</p>
        </div>
        <div className="bg-[var(--color-rose-light)] rounded-2xl p-4 border border-[var(--color-rose-border)]">
          <p className="text-xs text-[var(--color-rose-dark)] mb-1">Ingresos</p>
          <p className="text-lg font-semibold text-[var(--color-rose-dark)] font-mono leading-tight">
            {formatCurrency(todayIncome)}
          </p>
          <p className="text-[10px] text-[var(--color-rose-dark)]/70 mt-0.5">hoy</p>
        </div>
      </div>

      {/* CTA nuevo turno */}
      <Link
        href="/turnos/nuevo"
        className="flex items-center gap-3 w-full bg-[var(--color-primary)] text-white rounded-2xl px-5 py-4 mb-6 transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.98]"
      >
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          <CalendarPlus size={20} weight="light" />
        </div>
        <div>
          <p className="text-sm font-semibold">Nuevo turno</p>
          <p className="text-xs text-white/70">Registrar un nuevo cliente</p>
        </div>
      </Link>

      {/* Turnos de hoy */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--color-charcoal)]">Turnos de hoy</h2>
          <Link href="/agenda" className="text-xs text-[var(--color-rose-nude-hover)] font-medium">
            Ver agenda
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] px-5 py-8 text-center">
            <p className="text-sm text-[var(--color-charcoal-muted)]">No hay turnos para hoy</p>
            <p className="text-xs text-[var(--color-charcoal-subtle)] mt-1">
              Podés agregar uno desde el botón de arriba
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {todayAppointments.map((appointment) => (
              <Link
                key={appointment.id}
                href={`/turnos/${appointment.id}`}
                className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] px-4 py-3.5 flex items-center gap-3 transition-all hover:border-[var(--color-rose-border)] active:scale-[0.99]"
              >
                {/* Indicador de estado */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  appointment.status === 'completed'
                    ? 'bg-[var(--color-success)]'
                    : appointment.status === 'cancelled'
                    ? 'bg-[var(--color-error)]'
                    : 'bg-[var(--color-rose-nude)]'
                }`} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-charcoal)] truncate">
                    {appointment.client?.name ?? 'Sin cliente'}
                  </p>
                  <p className="text-xs text-[var(--color-charcoal-muted)] mt-0.5">
                    {formatTime(appointment.start_time)} — {formatTime(appointment.end_time)}
                    {appointment.appointment_services && appointment.appointment_services.length > 0 && (
                      <span className="ml-2 text-[var(--color-charcoal-subtle)]">
                        {appointment.appointment_services.length} servicio{appointment.appointment_services.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                </div>

                <StatusBadge status={appointment.status} />
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'bg-[var(--color-warning-light)] text-[var(--color-warning)]' },
    confirmed: { label: 'Confirmado', className: 'bg-[var(--color-rose-light)] text-[var(--color-rose-dark)]' },
    completed: { label: 'Listo', className: 'bg-[var(--color-success-light)] text-[var(--color-success)]' },
    cancelled: { label: 'Cancelado', className: 'bg-[var(--color-error-light)] text-[var(--color-error)]' },
  }
  const config = map[status] ?? map.pending
  return (
    <span className={`text-[10px] font-medium px-2 py-1 rounded-lg flex-shrink-0 ${config.className}`}>
      {config.label}
    </span>
  )
}
