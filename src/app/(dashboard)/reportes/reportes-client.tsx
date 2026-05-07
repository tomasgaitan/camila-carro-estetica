'use client'

import { useState } from 'react'
import { Money, ArrowsLeftRight, Tag } from '@phosphor-icons/react'

type Period = 'day' | 'week' | 'month'

interface PaymentRow {
  total: number
  method: string
  subtotal: number
  discount_value: number
  paid_at: string
  appointment?: { date: string } | null
}

export default function ReportesClient({
  payments,
  todayStr,
  startOfWeekStr,
  startOfMonthStr,
}: {
  payments: PaymentRow[]
  todayStr: string
  startOfWeekStr: string
  startOfMonthStr: string
}) {
  const [period, setPeriod] = useState<Period>('month')

  function filterByPeriod(p: PaymentRow) {
    const date = p.paid_at.split('T')[0]
    if (period === 'day') return date === todayStr
    if (period === 'week') return date >= startOfWeekStr && date <= todayStr
    return date >= startOfMonthStr && date <= todayStr
  }

  const filtered = payments.filter(filterByPeriod)
  const total = filtered.reduce((s, p) => s + p.total, 0)
  const totalCash = filtered.filter((p) => p.method === 'cash').reduce((s, p) => s + p.total, 0)
  const totalTransfer = filtered.filter((p) => p.method === 'transfer').reduce((s, p) => s + p.total, 0)
  const totalDiscounts = filtered.reduce((s, p) => s + (p.subtotal - p.total), 0)
  const count = filtered.length

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

  const periodLabel: Record<Period, string> = {
    day: 'Hoy',
    week: 'Esta semana',
    month: 'Este mes',
  }

  return (
    <>
      {/* Selector de período */}
      <div className="flex bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-1 mb-5">
        {(['day', 'week', 'month'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
              period === p
                ? 'bg-[var(--color-rose-nude)] text-white'
                : 'text-[var(--color-charcoal-muted)] hover:text-[var(--color-charcoal)]'
            }`}
          >
            {periodLabel[p]}
          </button>
        ))}
      </div>

      {/* Stat principal */}
      <div className="bg-[var(--color-rose-light)] rounded-2xl border border-[var(--color-rose-border)] p-5 mb-4">
        <p className="text-xs text-[var(--color-rose-dark)] uppercase tracking-wider font-medium mb-1">
          Ingresos — {periodLabel[period].toLowerCase()}
        </p>
        <p className="text-4xl font-semibold text-[var(--color-charcoal)] font-mono tracking-tight">
          {fmt(total)}
        </p>
        <p className="text-sm text-[var(--color-charcoal-muted)] mt-1">
          {count} pago{count !== 1 ? 's' : ''} registrado{count !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Desglose */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Money size={16} weight="light" className="text-[var(--color-charcoal-subtle)]" />
            <p className="text-xs text-[var(--color-charcoal-muted)] font-medium">Efectivo</p>
          </div>
          <p className="text-lg font-semibold text-[var(--color-charcoal)] font-mono">{fmt(totalCash)}</p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowsLeftRight size={16} weight="light" className="text-[var(--color-charcoal-subtle)]" />
            <p className="text-xs text-[var(--color-charcoal-muted)] font-medium">Transferencia</p>
          </div>
          <p className="text-lg font-semibold text-[var(--color-charcoal)] font-mono">{fmt(totalTransfer)}</p>
        </div>
      </div>

      {totalDiscounts > 0 && (
        <div className="flex items-center gap-3 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] px-4 py-3.5 mb-5">
          <Tag size={16} weight="light" className="text-[var(--color-charcoal-subtle)]" />
          <div>
            <p className="text-xs text-[var(--color-charcoal-muted)]">Total en descuentos aplicados</p>
            <p className="text-sm font-semibold text-[var(--color-charcoal)] font-mono mt-0.5">{fmt(totalDiscounts)}</p>
          </div>
        </div>
      )}

      {/* Historial */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--color-charcoal)] mb-3">Detalle de pagos</h2>
        {filtered.length === 0 ? (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] px-5 py-8 text-center">
            <p className="text-sm text-[var(--color-charcoal-muted)]">Sin pagos en este período</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
            {filtered.map((payment, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium text-[var(--color-charcoal)]">
                    {new Date(payment.paid_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                    {' '}
                    <span className="text-xs text-[var(--color-charcoal-subtle)]">
                      {new Date(payment.paid_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                  <p className="text-xs text-[var(--color-charcoal-muted)] mt-0.5 capitalize">
                    {payment.method === 'cash' ? 'Efectivo' : 'Transferencia'}
                    {payment.subtotal !== payment.total && (
                      <span className="ml-1.5 text-[var(--color-error)]">
                        (descuento −{fmt(payment.subtotal - payment.total)})
                      </span>
                    )}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[var(--color-charcoal)] font-mono">
                  {fmt(payment.total)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
