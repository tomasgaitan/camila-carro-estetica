'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Appointment } from '@/types'

export default function AppointmentActions({ appointment }: { appointment: Appointment }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function updateStatus(status: string) {
    setLoading(true)
    await supabase.from('appointments').update({ status }).eq('id', appointment.id)
    setLoading(false)
    router.refresh()
  }

  if (appointment.status === 'completed' || appointment.status === 'cancelled') return null

  return (
    <div className="flex flex-col gap-2 mt-2">
      {appointment.status === 'pending' && (
        <button
          onClick={() => updateStatus('confirmed')}
          disabled={loading}
          className="w-full h-11 rounded-xl border-2 border-[var(--color-rose-nude)] text-[var(--color-rose-dark)] text-sm font-medium transition-all hover:bg-[var(--color-rose-light)] active:scale-[0.98] disabled:opacity-60"
        >
          Confirmar turno
        </button>
      )}
      <button
        onClick={() => updateStatus('cancelled')}
        disabled={loading}
        className="w-full h-11 rounded-xl border border-[var(--color-border)] text-[var(--color-charcoal-muted)] text-sm font-medium transition-all hover:bg-[var(--color-error-light)] hover:text-[var(--color-error)] hover:border-[var(--color-error)]/30 active:scale-[0.98] disabled:opacity-60"
      >
        Cancelar turno
      </button>
    </div>
  )
}
