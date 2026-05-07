'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Money, ArrowsLeftRight } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'

export default function PaymentForm({
  appointmentId,
  subtotal,
}: {
  appointmentId: string
  subtotal: number
}) {
  const router = useRouter()
  const supabase = createClient()

  const [method, setMethod] = useState<'cash' | 'transfer'>('cash')
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [loading, setLoading] = useState(false)

  const discount = parseFloat(discountValue) || 0
  const discountAmount = discountType === 'percent'
    ? subtotal * (discount / 100)
    : Math.min(discount, subtotal)
  const total = Math.max(0, subtotal - discountAmount)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await supabase.from('payments').insert({
      appointment_id: appointmentId,
      method,
      subtotal,
      discount_type: discount > 0 ? discountType : null,
      discount_value: discount > 0 ? discount : 0,
      total,
    })

    await supabase
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', appointmentId)

    router.refresh()
  }

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 mb-4">
      <p className="text-sm font-semibold text-[var(--color-charcoal)] mb-4">Registrar pago</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Método de pago */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[var(--color-charcoal-soft)]">Método de pago</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMethod('cash')}
              className={`flex items-center gap-2 justify-center h-11 rounded-xl border text-sm font-medium transition-all ${
                method === 'cash'
                  ? 'border-[var(--color-rose-nude)] bg-[var(--color-rose-light)] text-[var(--color-rose-dark)]'
                  : 'border-[var(--color-border)] text-[var(--color-charcoal-muted)] hover:bg-[var(--color-background)]'
              }`}
            >
              <Money size={18} weight="light" />
              Efectivo
            </button>
            <button
              type="button"
              onClick={() => setMethod('transfer')}
              className={`flex items-center gap-2 justify-center h-11 rounded-xl border text-sm font-medium transition-all ${
                method === 'transfer'
                  ? 'border-[var(--color-rose-nude)] bg-[var(--color-rose-light)] text-[var(--color-rose-dark)]'
                  : 'border-[var(--color-border)] text-[var(--color-charcoal-muted)] hover:bg-[var(--color-background)]'
              }`}
            >
              <ArrowsLeftRight size={18} weight="light" />
              Transferencia
            </button>
          </div>
        </div>

        {/* Descuento */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[var(--color-charcoal-soft)]">Descuento (opcional)</label>
          <div className="flex gap-2">
            <div className="flex border border-[var(--color-rose-border)] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setDiscountType('percent')}
                className={`px-3 h-11 text-sm font-medium transition-colors ${
                  discountType === 'percent'
                    ? 'bg-[var(--color-rose-nude)] text-white'
                    : 'bg-transparent text-[var(--color-charcoal-muted)]'
                }`}
              >
                %
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('fixed')}
                className={`px-3 h-11 text-sm font-medium transition-colors ${
                  discountType === 'fixed'
                    ? 'bg-[var(--color-rose-nude)] text-white'
                    : 'bg-transparent text-[var(--color-charcoal-muted)]'
                }`}
              >
                $
              </button>
            </div>
            <input
              type="number"
              min="0"
              max={discountType === 'percent' ? 100 : subtotal}
              step="any"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === 'percent' ? '0 — 100' : '0'}
              className="flex-1 h-11 px-4 rounded-xl border border-[var(--color-rose-border)] bg-[var(--color-surface)] text-sm text-[var(--color-charcoal)] outline-none transition-all focus:border-[var(--color-rose-nude)] focus:ring-2 focus:ring-[var(--color-rose-nude)]/20"
            />
          </div>
        </div>

        {/* Resumen */}
        <div className="bg-[var(--color-rose-light)] rounded-xl border border-[var(--color-rose-border)] px-4 py-4 flex flex-col gap-1.5">
          <div className="flex justify-between text-sm text-[var(--color-charcoal-soft)]">
            <span>Subtotal</span>
            <span className="font-mono">${subtotal.toLocaleString('es-AR')}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-[var(--color-charcoal-soft)]">
              <span>Descuento</span>
              <span className="font-mono text-[var(--color-error)]">−${discountAmount.toLocaleString('es-AR')}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold text-[var(--color-charcoal)] pt-2 border-t border-[var(--color-rose-border)] mt-1">
            <span>Total</span>
            <span className="font-mono">${total.toLocaleString('es-AR')}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? 'Registrando...' : 'Confirmar y cerrar turno'}
        </button>
      </form>
    </div>
  )
}
