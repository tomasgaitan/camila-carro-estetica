'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Pencil, Clock, CurrencyDollar } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import type { Service } from '@/types'

const DURATION_OPTIONS = Array.from({ length: 12 }, (_, i) => (i + 1) * 5)

export default function ServicesCrud({ services }: { services: Service[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [sheet, setSheet] = useState<'new' | Service | null>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', duration_minutes: '30', category: '' })
  const [loading, setLoading] = useState(false)

  function openNew() {
    setForm({ name: '', description: '', price: '', duration_minutes: '30', category: '' })
    setSheet('new')
  }

  function openEdit(service: Service) {
    setForm({
      name: service.name,
      description: service.description ?? '',
      price: service.price.toString(),
      duration_minutes: service.duration_minutes.toString(),
      category: service.category ?? '',
    })
    setSheet(service)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      duration_minutes: parseInt(form.duration_minutes),
      category: form.category.trim() || null,
    }
    if (sheet === 'new') {
      await supabase.from('services').insert(payload)
    } else if (sheet) {
      await supabase.from('services').update(payload).eq('id', (sheet as Service).id)
    }
    setLoading(false)
    setSheet(null)
    router.refresh()
  }

  async function toggleActive(service: Service) {
    await supabase.from('services').update({ active: !service.active }).eq('id', service.id)
    router.refresh()
  }

  const active = services.filter((s) => s.active)
  const inactive = services.filter((s) => !s.active)

  return (
    <>
      <button
        onClick={openNew}
        className="flex items-center gap-2 w-full bg-[var(--color-primary)] text-white text-sm font-medium px-5 py-3.5 rounded-2xl mb-5 transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.98]"
      >
        <Plus size={18} weight="light" />
        Agregar servicio
      </button>

      {services.length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] px-5 py-10 text-center">
          <p className="text-sm text-[var(--color-charcoal-muted)]">Todavía no hay servicios cargados</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <ServiceList title="Activos" services={active} onEdit={openEdit} onToggle={toggleActive} />
          )}
          {inactive.length > 0 && (
            <ServiceList title="Inactivos" services={inactive} onEdit={openEdit} onToggle={toggleActive} />
          )}
        </>
      )}

      {/* Sheet */}
      {sheet !== null && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setSheet(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative w-full bg-[var(--color-surface)] rounded-t-3xl px-5 pt-5 pb-10 max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[var(--color-charcoal)]">
                {sheet === 'new' ? 'Nuevo servicio' : 'Editar servicio'}
              </h2>
              <button onClick={() => setSheet(null)} className="w-8 h-8 rounded-full bg-[var(--color-background)] flex items-center justify-center">
                <X size={16} weight="bold" className="text-[var(--color-charcoal-muted)]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormField label="Nombre *" name="name" value={form.name} onChange={handleChange} required />
              <FormField label="Categoría" name="category" value={form.category} onChange={handleChange} placeholder="Ej: Depilación, Facial..." />

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--color-charcoal-soft)]">Precio *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-charcoal-subtle)]">$</span>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full h-11 pl-7 pr-4 rounded-xl border border-[var(--color-rose-border)] bg-[var(--color-background)] text-sm text-[var(--color-charcoal)] outline-none transition-all focus:border-[var(--color-rose-nude)] focus:ring-2 focus:ring-[var(--color-rose-nude)]/20"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--color-charcoal-soft)]">Duración *</label>
                  <select
                    name="duration_minutes"
                    value={form.duration_minutes}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-xl border border-[var(--color-rose-border)] bg-[var(--color-background)] text-sm text-[var(--color-charcoal)] outline-none transition-all focus:border-[var(--color-rose-nude)]"
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d} min</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium mt-2 transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function ServiceList({
  title, services, onEdit, onToggle
}: {
  title: string
  services: Service[]
  onEdit: (s: Service) => void
  onToggle: (s: Service) => void
}) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold tracking-wider uppercase text-[var(--color-charcoal-subtle)] mb-2 px-1">{title}</p>
      <div className="flex flex-col divide-y divide-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
        {services.map((service) => (
          <div key={service.id} className="flex items-center gap-3 px-4 py-3.5">
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${service.active ? 'text-[var(--color-charcoal)]' : 'text-[var(--color-charcoal-subtle)]'}`}>
                {service.name}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-xs text-[var(--color-charcoal-muted)]">
                  <Clock size={11} weight="light" />
                  {service.duration_minutes} min
                </span>
                <span className="text-xs font-semibold text-[var(--color-charcoal-soft)] font-mono">
                  ${service.price.toLocaleString('es-AR')}
                </span>
                {service.category && (
                  <span className="text-xs text-[var(--color-charcoal-subtle)] bg-[var(--color-background)] px-2 py-0.5 rounded-lg">
                    {service.category}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onEdit(service)}
                className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-charcoal-subtle)] hover:bg-[var(--color-rose-light)] transition-colors"
              >
                <Pencil size={14} weight="light" />
              </button>
              <button
                onClick={() => onToggle(service)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  service.active
                    ? 'bg-[var(--color-background)] text-[var(--color-charcoal-muted)] hover:bg-[var(--color-rose-light)]'
                    : 'bg-[var(--color-success-light)] text-[var(--color-success)]'
                }`}
              >
                {service.active ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FormField({ label, name, value, onChange, placeholder, required = false }: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[var(--color-charcoal-soft)]">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full h-11 px-4 rounded-xl border border-[var(--color-rose-border)] bg-[var(--color-background)] text-sm text-[var(--color-charcoal)] outline-none transition-all focus:border-[var(--color-rose-nude)] focus:ring-2 focus:ring-[var(--color-rose-nude)]/20"
      />
    </div>
  )
}
