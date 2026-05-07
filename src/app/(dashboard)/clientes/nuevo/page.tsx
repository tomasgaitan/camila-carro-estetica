'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'

export default function NuevoClientePage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('clients').insert({
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      notes: form.notes.trim() || null,
    })

    if (error) {
      setError('Ocurrió un error al guardar el cliente')
      setLoading(false)
      return
    }

    router.push('/clientes')
    router.refresh()
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6 pt-2">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl border border-[var(--color-border)] flex items-center justify-center text-[var(--color-charcoal-muted)] hover:bg-[var(--color-rose-light)] transition-colors"
        >
          <ArrowLeft size={18} weight="light" />
        </button>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--color-charcoal)]">
          Nuevo cliente
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="Nombre *" name="name" value={form.name} onChange={handleChange} placeholder="Nombre completo" required />
        <Field label="Teléfono" name="phone" value={form.phone} onChange={handleChange} placeholder="+54 9 11..." type="tel" />
        <Field label="Email" name="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" type="email" />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[var(--color-charcoal-soft)]">Notas</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Alergias, preferencias, observaciones..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-rose-border)] bg-[var(--color-surface)] text-sm text-[var(--color-charcoal)] placeholder:text-[var(--color-charcoal-subtle)] outline-none resize-none transition-all focus:border-[var(--color-rose-nude)] focus:ring-2 focus:ring-[var(--color-rose-nude)]/20"
          />
        </div>

        {error && (
          <p className="text-sm text-[var(--color-error)] bg-[var(--color-error-light)] px-4 py-3 rounded-xl">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !form.name.trim()}
          className="w-full h-12 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'Guardar cliente'}
        </button>
      </form>
    </div>
  )
}

function Field({
  label, name, value, onChange, placeholder, type = 'text', required = false
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[var(--color-charcoal-soft)]">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full h-11 px-4 rounded-xl border border-[var(--color-rose-border)] bg-[var(--color-surface)] text-sm text-[var(--color-charcoal)] placeholder:text-[var(--color-charcoal-subtle)] outline-none transition-all focus:border-[var(--color-rose-nude)] focus:ring-2 focus:ring-[var(--color-rose-nude)]/20"
      />
    </div>
  )
}
