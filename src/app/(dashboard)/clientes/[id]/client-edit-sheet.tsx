'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NotePencil, X } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import type { Client } from '@/types'

export default function ClientEditSheet({ client }: { client: Client }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: client.name,
    phone: client.phone ?? '',
    email: client.email ?? '',
    notes: client.notes ?? '',
  })
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.from('clients').update({
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      notes: form.notes.trim() || null,
    }).eq('id', client.id)
    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-[var(--color-charcoal-muted)] border border-[var(--color-border)] px-3 py-2 rounded-xl hover:bg-[var(--color-rose-light)] transition-colors"
      >
        <NotePencil size={15} weight="light" />
        Editar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setOpen(false)}>
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div
            className="relative w-full bg-[var(--color-surface)] rounded-t-3xl px-5 pt-5 pb-10 max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[var(--color-charcoal)]">Editar cliente</h2>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-[var(--color-background)] flex items-center justify-center">
                <X size={16} weight="bold" className="text-[var(--color-charcoal-muted)]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {[
                { label: 'Nombre *', name: 'name', type: 'text', required: true },
                { label: 'Teléfono', name: 'phone', type: 'tel' },
                { label: 'Email', name: 'email', type: 'email' },
              ].map(({ label, name, type, required }) => (
                <div key={name} className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--color-charcoal-soft)]">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={form[name as keyof typeof form]}
                    onChange={handleChange}
                    required={required}
                    className="w-full h-11 px-4 rounded-xl border border-[var(--color-rose-border)] bg-[var(--color-background)] text-sm text-[var(--color-charcoal)] outline-none transition-all focus:border-[var(--color-rose-nude)] focus:ring-2 focus:ring-[var(--color-rose-nude)]/20"
                  />
                </div>
              ))}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--color-charcoal-soft)]">Notas</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-rose-border)] bg-[var(--color-background)] text-sm text-[var(--color-charcoal)] outline-none resize-none transition-all focus:border-[var(--color-rose-nude)] focus:ring-2 focus:ring-[var(--color-rose-nude)]/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium mt-2 transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
