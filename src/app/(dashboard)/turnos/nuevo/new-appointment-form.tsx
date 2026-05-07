'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Plus, X, MagnifyingGlass } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import type { Client, Service, Product } from '@/types'

const TIME_SLOTS = Array.from({ length: 28 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30
  const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0')
  const m = (totalMinutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
})

interface SelectedService { service: Service }
interface SelectedProduct { product: Product; quantity: number }

export default function NewAppointmentForm({
  clients, services, products
}: {
  clients: Pick<Client, 'id' | 'name' | 'phone'>[]
  services: Service[]
  products: Product[]
}) {
  const router = useRouter()
  const supabase = createClient()

  const today = new Date().toISOString().split('T')[0]

  const [clientId, setClientId] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [showClientList, setShowClientList] = useState(false)
  const [date, setDate] = useState(today)
  const [startTime, setStartTime] = useState('09:00')
  const [notes, setNotes] = useState('')
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [showServices, setShowServices] = useState(false)
  const [showProducts, setShowProducts] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedClient = clients.find((c) => c.id === clientId)

  const filteredClients = useMemo(() =>
    clients.filter((c) => c.name.toLowerCase().includes(clientSearch.toLowerCase())),
    [clients, clientSearch]
  )

  const endTime = useMemo(() => {
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.service.duration_minutes, 0) || 30
    const [h, m] = startTime.split(':').map(Number)
    const endMinutes = h * 60 + m + totalDuration
    const eh = Math.floor(endMinutes / 60).toString().padStart(2, '0')
    const em = (endMinutes % 60).toString().padStart(2, '0')
    return `${eh}:${em}`
  }, [startTime, selectedServices])

  const subtotal = useMemo(() => {
    const servicesTotal = selectedServices.reduce((sum, s) => sum + s.service.price, 0)
    const productsTotal = selectedProducts.reduce((sum, p) => sum + p.product.price * p.quantity, 0)
    return servicesTotal + productsTotal
  }, [selectedServices, selectedProducts])

  function toggleService(service: Service) {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.service.id === service.id)
      return exists ? prev.filter((s) => s.service.id !== service.id) : [...prev, { service }]
    })
  }

  function toggleProduct(product: Product) {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.product.id === product.id)
      return exists ? prev.filter((p) => p.product.id !== product.id) : [...prev, { product, quantity: 1 }]
    })
  }

  function updateProductQty(productId: string, delta: number) {
    setSelectedProducts((prev) =>
      prev.map((p) => p.product.id === productId
        ? { ...p, quantity: Math.max(1, p.quantity + delta) }
        : p
      )
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clientId || selectedServices.length === 0) {
      setError('Seleccioná al menos un cliente y un servicio')
      return
    }
    setLoading(true)
    setError(null)

    const { data: appointment, error: apptError } = await supabase
      .from('appointments')
      .insert({
        client_id: clientId,
        date,
        start_time: startTime,
        end_time: endTime,
        status: 'pending',
        notes: notes.trim() || null,
      })
      .select('id')
      .single()

    if (apptError || !appointment) {
      setError('Error al crear el turno')
      setLoading(false)
      return
    }

    const appointmentId = appointment.id

    await Promise.all([
      selectedServices.length > 0 && supabase.from('appointment_services').insert(
        selectedServices.map((s) => ({
          appointment_id: appointmentId,
          service_id: s.service.id,
          service_name: s.service.name,
          price_at_time: s.service.price,
        }))
      ),
      selectedProducts.length > 0 && supabase.from('appointment_products').insert(
        selectedProducts.map((p) => ({
          appointment_id: appointmentId,
          product_id: p.product.id,
          product_name: p.product.name,
          quantity: p.quantity,
          price_at_time: p.product.price,
        }))
      ),
    ])

    router.push(`/turnos/${appointmentId}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Cliente */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--color-charcoal-soft)]">Cliente *</label>
        {selectedClient ? (
          <div className="flex items-center gap-3 bg-[var(--color-rose-light)] border border-[var(--color-rose-border)] rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-rose-nude)] flex items-center justify-center text-white text-sm font-semibold">
              {selectedClient.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-charcoal)]">{selectedClient.name}</p>
              {selectedClient.phone && <p className="text-xs text-[var(--color-charcoal-muted)]">{selectedClient.phone}</p>}
            </div>
            <button type="button" onClick={() => { setClientId(''); setClientSearch('') }} className="text-[var(--color-charcoal-subtle)]">
              <X size={16} weight="light" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <MagnifyingGlass size={16} weight="light" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-charcoal-subtle)]" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={clientSearch}
              onChange={(e) => { setClientSearch(e.target.value); setShowClientList(true) }}
              onFocus={() => setShowClientList(true)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[var(--color-rose-border)] bg-[var(--color-surface)] text-sm text-[var(--color-charcoal)] outline-none transition-all focus:border-[var(--color-rose-nude)] focus:ring-2 focus:ring-[var(--color-rose-nude)]/20"
            />
            {showClientList && filteredClients.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-surface)] border border-[var(--color-rose-border)] rounded-xl overflow-hidden shadow-lg z-10 max-h-48 overflow-y-auto">
                {filteredClients.slice(0, 8).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setClientId(c.id); setClientSearch(''); setShowClientList(false) }}
                    className="w-full text-left px-4 py-3 hover:bg-[var(--color-rose-light)] transition-colors border-b border-[var(--color-border)] last:border-0"
                  >
                    <p className="text-sm font-medium text-[var(--color-charcoal)]">{c.name}</p>
                    {c.phone && <p className="text-xs text-[var(--color-charcoal-muted)]">{c.phone}</p>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fecha y hora */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[var(--color-charcoal-soft)]">Fecha *</label>
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full h-11 px-4 rounded-xl border border-[var(--color-rose-border)] bg-[var(--color-surface)] text-sm text-[var(--color-charcoal)] outline-none transition-all focus:border-[var(--color-rose-nude)] focus:ring-2 focus:ring-[var(--color-rose-nude)]/20"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[var(--color-charcoal-soft)]">Hora de inicio *</label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-[var(--color-rose-border)] bg-[var(--color-surface)] text-sm text-[var(--color-charcoal)] outline-none transition-all focus:border-[var(--color-rose-nude)]"
          >
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedServices.length > 0 && (
        <p className="text-xs text-[var(--color-charcoal-muted)] -mt-3">
          Fin estimado: <span className="font-semibold text-[var(--color-charcoal)]">{endTime}</span>
        </p>
      )}

      {/* Servicios */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--color-charcoal-soft)]">
            Servicios * {selectedServices.length > 0 && <span className="text-[var(--color-rose-nude)]">({selectedServices.length})</span>}
          </label>
          <button
            type="button"
            onClick={() => setShowServices(!showServices)}
            className="flex items-center gap-1 text-xs text-[var(--color-rose-nude-hover)] font-medium"
          >
            <Plus size={14} weight="light" />
            Agregar
          </button>
        </div>

        {selectedServices.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {selectedServices.map((s) => (
              <div key={s.service.id} className="flex items-center gap-2 bg-[var(--color-rose-light)] rounded-xl px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-charcoal)] truncate">{s.service.name}</p>
                  <p className="text-xs text-[var(--color-charcoal-muted)]">{s.service.duration_minutes} min · ${s.service.price.toLocaleString('es-AR')}</p>
                </div>
                <button type="button" onClick={() => toggleService(s.service)}>
                  <X size={15} weight="light" className="text-[var(--color-charcoal-subtle)]" />
                </button>
              </div>
            ))}
          </div>
        )}

        {showServices && (
          <div className="border border-[var(--color-rose-border)] rounded-2xl overflow-hidden">
            {services.map((service) => {
              const selected = selectedServices.some((s) => s.service.id === service.id)
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service)}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] last:border-0 transition-colors text-left ${selected ? 'bg-[var(--color-rose-light)]' : 'hover:bg-[var(--color-background)]'}`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected ? 'border-[var(--color-rose-nude)] bg-[var(--color-rose-nude)]' : 'border-[var(--color-rose-border)]'}`}>
                    {selected && <Check size={12} weight="bold" className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-charcoal)] truncate">{service.name}</p>
                    <p className="text-xs text-[var(--color-charcoal-muted)]">{service.duration_minutes} min</p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-charcoal)] font-mono">${service.price.toLocaleString('es-AR')}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Productos */}
      {products.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--color-charcoal-soft)]">
              Productos {selectedProducts.length > 0 && <span className="text-[var(--color-rose-nude)]">({selectedProducts.length})</span>}
            </label>
            <button
              type="button"
              onClick={() => setShowProducts(!showProducts)}
              className="flex items-center gap-1 text-xs text-[var(--color-rose-nude-hover)] font-medium"
            >
              <Plus size={14} weight="light" />
              Agregar
            </button>
          </div>

          {selectedProducts.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {selectedProducts.map((p) => (
                <div key={p.product.id} className="flex items-center gap-2 bg-[var(--color-rose-light)] rounded-xl px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-charcoal)] truncate">{p.product.name}</p>
                    <p className="text-xs text-[var(--color-charcoal-muted)]">${p.product.price.toLocaleString('es-AR')} c/u</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => updateProductQty(p.product.id, -1)} className="w-6 h-6 rounded-lg border border-[var(--color-rose-border)] text-xs flex items-center justify-center">−</button>
                    <span className="text-sm font-semibold text-[var(--color-charcoal)] w-4 text-center font-mono">{p.quantity}</span>
                    <button type="button" onClick={() => updateProductQty(p.product.id, 1)} className="w-6 h-6 rounded-lg border border-[var(--color-rose-border)] text-xs flex items-center justify-center">+</button>
                  </div>
                  <button type="button" onClick={() => toggleProduct(p.product)}>
                    <X size={15} weight="light" className="text-[var(--color-charcoal-subtle)]" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showProducts && (
            <div className="border border-[var(--color-rose-border)] rounded-2xl overflow-hidden">
              {products.map((product) => {
                const selected = selectedProducts.some((p) => p.product.id === product.id)
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => toggleProduct(product)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] last:border-0 transition-colors text-left ${selected ? 'bg-[var(--color-rose-light)]' : 'hover:bg-[var(--color-background)]'}`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected ? 'border-[var(--color-rose-nude)] bg-[var(--color-rose-nude)]' : 'border-[var(--color-rose-border)]'}`}>
                      {selected && <Check size={12} weight="bold" className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-charcoal)] truncate">{product.name}</p>
                      <p className="text-xs text-[var(--color-charcoal-muted)]">Stock: {product.stock}</p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-charcoal)] font-mono">${product.price.toLocaleString('es-AR')}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Notas */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--color-charcoal-soft)]">Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observaciones del turno..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-rose-border)] bg-[var(--color-surface)] text-sm text-[var(--color-charcoal)] placeholder:text-[var(--color-charcoal-subtle)] outline-none resize-none transition-all focus:border-[var(--color-rose-nude)] focus:ring-2 focus:ring-[var(--color-rose-nude)]/20"
        />
      </div>

      {/* Resumen */}
      {subtotal > 0 && (
        <div className="bg-[var(--color-rose-light)] rounded-2xl border border-[var(--color-rose-border)] px-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--color-rose-dark)]">Total estimado</p>
            <p className="text-xl font-semibold text-[var(--color-rose-dark)] font-mono">
              ${subtotal.toLocaleString('es-AR')}
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-[var(--color-error)] bg-[var(--color-error-light)] px-4 py-3 rounded-xl">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !clientId || selectedServices.length === 0}
        className="w-full h-12 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Guardando...' : 'Confirmar turno'}
      </button>
    </form>
  )
}
