import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, EnvelopeSimple, NotePencil, CalendarDots } from '@phosphor-icons/react/dist/ssr'
import type { Appointment } from '@/types'
import ClientEditSheet from './client-edit-sheet'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: appointments }] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase
      .from('appointments')
      .select('*, appointment_services(*), payment(*)')
      .eq('client_id', id)
      .order('date', { ascending: false })
      .limit(10),
  ])

  if (!client) notFound()

  const totalSpent = (appointments as Appointment[] | null)
    ?.filter((a) => a.payment)
    .reduce((sum, a) => sum + (a.payment?.total ?? 0), 0) ?? 0

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6 pt-2">
        <div className="flex items-center gap-3">
          <Link
            href="/clientes"
            className="w-9 h-9 rounded-xl border border-[var(--color-border)] flex items-center justify-center text-[var(--color-charcoal-muted)] hover:bg-[var(--color-rose-light)] transition-colors"
          >
            <ArrowLeft size={18} weight="light" />
          </Link>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--color-charcoal)]">
            Detalle
          </h1>
        </div>
        <ClientEditSheet client={client} />
      </div>

      {/* Perfil */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-[var(--color-rose-light)] flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-semibold text-[var(--color-rose-dark)]">
              {client.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--color-charcoal)]">{client.name}</p>
            <p className="text-xs text-[var(--color-charcoal-subtle)] mt-0.5">
              Cliente desde {new Date(client.created_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {client.phone && (
            <div className="flex items-center gap-2.5 text-sm text-[var(--color-charcoal-soft)]">
              <Phone size={16} weight="light" className="text-[var(--color-charcoal-subtle)]" />
              {client.phone}
            </div>
          )}
          {client.email && (
            <div className="flex items-center gap-2.5 text-sm text-[var(--color-charcoal-soft)]">
              <EnvelopeSimple size={16} weight="light" className="text-[var(--color-charcoal-subtle)]" />
              {client.email}
            </div>
          )}
          {client.notes && (
            <div className="flex items-start gap-2.5 text-sm text-[var(--color-charcoal-soft)]">
              <NotePencil size={16} weight="light" className="text-[var(--color-charcoal-subtle)] mt-0.5" />
              <p className="leading-relaxed">{client.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-[var(--color-rose-light)] rounded-2xl p-4 border border-[var(--color-rose-border)]">
          <p className="text-xs text-[var(--color-rose-dark)] mb-1">Total gastado</p>
          <p className="text-xl font-semibold text-[var(--color-rose-dark)] font-mono">
            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(totalSpent)}
          </p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-charcoal-muted)] mb-1">Visitas</p>
          <p className="text-xl font-semibold text-[var(--color-charcoal)] font-mono">
            {appointments?.filter((a) => a.status === 'completed').length ?? 0}
          </p>
        </div>
      </div>

      {/* Historial */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--color-charcoal)] mb-3">Historial de turnos</h2>
        {!appointments || appointments.length === 0 ? (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] px-5 py-8 text-center">
            <CalendarDots size={24} weight="light" className="text-[var(--color-charcoal-subtle)] mx-auto mb-2" />
            <p className="text-sm text-[var(--color-charcoal-muted)]">Sin turnos registrados</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
            {(appointments as Appointment[]).map((appt) => (
              <Link
                key={appt.id}
                href={`/turnos/${appt.id}`}
                className="px-4 py-3.5 hover:bg-[var(--color-background)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-charcoal)]">
                      {new Date(appt.date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-[var(--color-charcoal-muted)] mt-0.5">
                      {appt.start_time.slice(0, 5)} — {appt.end_time.slice(0, 5)}
                      {appt.appointment_services && appt.appointment_services.length > 0 && (
                        <span className="ml-2">{appt.appointment_services.map((s) => s.service_name).join(', ')}</span>
                      )}
                    </p>
                  </div>
                  {appt.payment && (
                    <p className="text-sm font-semibold text-[var(--color-charcoal)] font-mono">
                      {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(appt.payment.total)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
