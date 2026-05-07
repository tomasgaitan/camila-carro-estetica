import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CalendarDots, Clock, User } from '@phosphor-icons/react/dist/ssr'
import type { Appointment } from '@/types'
import AppointmentActions from './appointment-actions'
import PaymentForm from './payment-form'

export default async function TurnoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: appointment } = await supabase
    .from('appointments')
    .select('*, client:clients(*), appointment_services(*), appointment_products(*), payment:payments(*)')
    .eq('id', id)
    .single()

  if (!appointment) notFound()

  const appt = appointment as Appointment & { payment: Appointment['payment'] }
  const subtotal =
    (appt.appointment_services?.reduce((s, i) => s + i.price_at_time, 0) ?? 0) +
    (appt.appointment_products?.reduce((s, i) => s + i.price_at_time * i.quantity, 0) ?? 0)

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6 pt-2">
        <Link
          href="/agenda"
          className="w-9 h-9 rounded-xl border border-[var(--color-border)] flex items-center justify-center text-[var(--color-charcoal-muted)] hover:bg-[var(--color-rose-light)] transition-colors"
        >
          <ArrowLeft size={18} weight="light" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight text-[var(--color-charcoal)]">Detalle del turno</h1>
        </div>
        <StatusBadge status={appt.status} />
      </div>

      {/* Info principal */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 mb-4">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--color-border)]">
          <div className="w-11 h-11 rounded-full bg-[var(--color-rose-light)] flex items-center justify-center">
            <span className="text-base font-semibold text-[var(--color-rose-dark)]">
              {appt.client?.name?.charAt(0) ?? '?'}
            </span>
          </div>
          <div>
            <p className="text-base font-semibold text-[var(--color-charcoal)]">
              {appt.client?.name ?? 'Sin cliente'}
            </p>
            {appt.client?.phone && (
              <p className="text-xs text-[var(--color-charcoal-muted)]">{appt.client.phone}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5 text-sm text-[var(--color-charcoal-soft)]">
            <CalendarDots size={16} weight="light" className="text-[var(--color-charcoal-subtle)]" />
            {new Date(appt.date + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-2.5 text-sm text-[var(--color-charcoal-soft)]">
            <Clock size={16} weight="light" className="text-[var(--color-charcoal-subtle)]" />
            {appt.start_time.slice(0, 5)} — {appt.end_time.slice(0, 5)}
          </div>
          {appt.notes && (
            <p className="text-sm text-[var(--color-charcoal-muted)] italic mt-1">{appt.notes}</p>
          )}
        </div>
      </div>

      {/* Servicios */}
      {appt.appointment_services && appt.appointment_services.length > 0 && (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden mb-4">
          <p className="text-xs font-semibold tracking-wider uppercase text-[var(--color-charcoal-subtle)] px-4 pt-4 pb-2">Servicios</p>
          <div className="divide-y divide-[var(--color-border)]">
            {appt.appointment_services.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <p className="text-sm text-[var(--color-charcoal)]">{s.service_name}</p>
                <p className="text-sm font-semibold text-[var(--color-charcoal)] font-mono">
                  ${s.price_at_time.toLocaleString('es-AR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Productos */}
      {appt.appointment_products && appt.appointment_products.length > 0 && (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden mb-4">
          <p className="text-xs font-semibold tracking-wider uppercase text-[var(--color-charcoal-subtle)] px-4 pt-4 pb-2">Productos</p>
          <div className="divide-y divide-[var(--color-border)]">
            {appt.appointment_products.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-[var(--color-charcoal)]">{p.product_name}</p>
                  <p className="text-xs text-[var(--color-charcoal-muted)]">x{p.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-[var(--color-charcoal)] font-mono">
                  ${(p.price_at_time * p.quantity).toLocaleString('es-AR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pago existente o form */}
      {appt.payment ? (
        <div className="bg-[var(--color-success-light)] rounded-2xl border border-[var(--color-success)]/20 p-5 mb-4">
          <p className="text-xs font-semibold tracking-wider uppercase text-[var(--color-success)] mb-3">Pago registrado</p>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[var(--color-charcoal-soft)]">Subtotal</p>
            <p className="text-sm font-mono text-[var(--color-charcoal)]">${appt.payment.subtotal.toLocaleString('es-AR')}</p>
          </div>
          {appt.payment.discount_value > 0 && (
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--color-charcoal-soft)]">
                Descuento {appt.payment.discount_type === 'percent' ? `(${appt.payment.discount_value}%)` : ''}
              </p>
              <p className="text-sm font-mono text-[var(--color-charcoal)]">
                −${(appt.payment.subtotal - appt.payment.total).toLocaleString('es-AR')}
              </p>
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--color-success)]/20">
            <p className="text-base font-semibold text-[var(--color-charcoal)]">Total</p>
            <p className="text-xl font-semibold text-[var(--color-charcoal)] font-mono">
              ${appt.payment.total.toLocaleString('es-AR')}
            </p>
          </div>
          <p className="text-xs text-[var(--color-charcoal-muted)] mt-3 capitalize">
            {appt.payment.method === 'cash' ? 'Efectivo' : 'Transferencia'}
          </p>
        </div>
      ) : appt.status !== 'cancelled' && (
        <PaymentForm appointmentId={appt.id} subtotal={subtotal} />
      )}

      {/* Acciones de estado */}
      <AppointmentActions appointment={appt} />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'bg-[var(--color-warning-light)] text-[var(--color-warning)]' },
    confirmed: { label: 'Confirmado', className: 'bg-[var(--color-rose-light)] text-[var(--color-rose-dark)]' },
    completed: { label: 'Completado', className: 'bg-[var(--color-success-light)] text-[var(--color-success)]' },
    cancelled: { label: 'Cancelado', className: 'bg-[var(--color-error-light)] text-[var(--color-error)]' },
  }
  const config = map[status] ?? map.pending
  return (
    <span className={`text-xs font-medium px-3 py-1.5 rounded-xl ${config.className}`}>
      {config.label}
    </span>
  )
}
