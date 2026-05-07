'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Pencil, Warning } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types'

export default function ProductsCrud({ products }: { products: Product[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [sheet, setSheet] = useState<'new' | Product | null>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '0' })
  const [loading, setLoading] = useState(false)

  function openNew() {
    setForm({ name: '', description: '', price: '', stock: '0' })
    setSheet('new')
  }

  function openEdit(product: Product) {
    setForm({
      name: product.name,
      description: product.description ?? '',
      price: product.price.toString(),
      stock: product.stock.toString(),
    })
    setSheet(product)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
    }
    if (sheet === 'new') {
      await supabase.from('products').insert(payload)
    } else if (sheet) {
      await supabase.from('products').update(payload).eq('id', (sheet as Product).id)
    }
    setLoading(false)
    setSheet(null)
    router.refresh()
  }

  async function updateStock(product: Product, delta: number) {
    const newStock = Math.max(0, product.stock + delta)
    await supabase.from('products').update({ stock: newStock }).eq('id', product.id)
    router.refresh()
  }

  async function toggleActive(product: Product) {
    await supabase.from('products').update({ active: !product.active }).eq('id', product.id)
    router.refresh()
  }

  const active = products.filter((p) => p.active)
  const inactive = products.filter((p) => !p.active)
  const lowStock = active.filter((p) => p.stock <= 2)

  return (
    <>
      <button
        onClick={openNew}
        className="flex items-center gap-2 w-full bg-[var(--color-primary)] text-white text-sm font-medium px-5 py-3.5 rounded-2xl mb-5 transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.98]"
      >
        <Plus size={18} weight="light" />
        Agregar producto
      </button>

      {lowStock.length > 0 && (
        <div className="flex items-start gap-2.5 bg-[var(--color-warning-light)] border border-[var(--color-warning)]/20 rounded-2xl px-4 py-3 mb-4">
          <Warning size={16} weight="fill" className="text-[var(--color-warning)] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[var(--color-warning)]">
            <strong>{lowStock.length} producto{lowStock.length !== 1 ? 's' : ''}</strong> con stock bajo: {lowStock.map((p) => p.name).join(', ')}
          </p>
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] px-5 py-10 text-center">
          <p className="text-sm text-[var(--color-charcoal-muted)]">Todavía no hay productos cargados</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <ProductList title="Activos" products={active} onEdit={openEdit} onToggle={toggleActive} onStockChange={updateStock} />
          )}
          {inactive.length > 0 && (
            <ProductList title="Inactivos" products={inactive} onEdit={openEdit} onToggle={toggleActive} onStockChange={updateStock} />
          )}
        </>
      )}

      {sheet !== null && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setSheet(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative w-full bg-[var(--color-surface)] rounded-t-3xl px-5 pt-5 pb-10 max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[var(--color-charcoal)]">
                {sheet === 'new' ? 'Nuevo producto' : 'Editar producto'}
              </h2>
              <button onClick={() => setSheet(null)} className="w-8 h-8 rounded-full bg-[var(--color-background)] flex items-center justify-center">
                <X size={16} weight="bold" className="text-[var(--color-charcoal-muted)]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--color-charcoal-soft)]">Nombre *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required
                  className="w-full h-11 px-4 rounded-xl border border-[var(--color-rose-border)] bg-[var(--color-background)] text-sm text-[var(--color-charcoal)] outline-none transition-all focus:border-[var(--color-rose-nude)] focus:ring-2 focus:ring-[var(--color-rose-nude)]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--color-charcoal-soft)]">Precio *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-charcoal-subtle)]">$</span>
                    <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" step="0.01"
                      className="w-full h-11 pl-7 pr-4 rounded-xl border border-[var(--color-rose-border)] bg-[var(--color-background)] text-sm text-[var(--color-charcoal)] outline-none transition-all focus:border-[var(--color-rose-nude)] focus:ring-2 focus:ring-[var(--color-rose-nude)]/20"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--color-charcoal-soft)]">Stock</label>
                  <input type="number" name="stock" value={form.stock} onChange={handleChange} min="0"
                    className="w-full h-11 px-4 rounded-xl border border-[var(--color-rose-border)] bg-[var(--color-background)] text-sm text-[var(--color-charcoal)] outline-none transition-all focus:border-[var(--color-rose-nude)] focus:ring-2 focus:ring-[var(--color-rose-nude)]/20"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading}
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

function ProductList({ title, products, onEdit, onToggle, onStockChange }: {
  title: string
  products: Product[]
  onEdit: (p: Product) => void
  onToggle: (p: Product) => void
  onStockChange: (p: Product, delta: number) => void
}) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold tracking-wider uppercase text-[var(--color-charcoal-subtle)] mb-2 px-1">{title}</p>
      <div className="flex flex-col divide-y divide-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
        {products.map((product) => (
          <div key={product.id} className="px-4 py-3.5">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${product.active ? 'text-[var(--color-charcoal)]' : 'text-[var(--color-charcoal-subtle)]'}`}>
                  {product.name}
                </p>
                <p className="text-xs font-semibold text-[var(--color-charcoal-soft)] font-mono mt-0.5">
                  ${product.price.toLocaleString('es-AR')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onEdit(product)} className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-charcoal-subtle)] hover:bg-[var(--color-rose-light)] transition-colors">
                  <Pencil size={14} weight="light" />
                </button>
                <button onClick={() => onToggle(product)} className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${product.active ? 'bg-[var(--color-background)] text-[var(--color-charcoal-muted)]' : 'bg-[var(--color-success-light)] text-[var(--color-success)]'}`}>
                  {product.active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>

            {/* Stock control */}
            <div className="flex items-center gap-3 mt-3">
              <span className={`text-xs font-medium ${product.stock <= 2 ? 'text-[var(--color-warning)]' : 'text-[var(--color-charcoal-muted)]'}`}>
                Stock: <span className="font-mono font-semibold">{product.stock}</span>
              </span>
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={() => onStockChange(product, -1)}
                  disabled={product.stock === 0}
                  className="w-7 h-7 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-charcoal-muted)] flex items-center justify-center hover:bg-[var(--color-rose-light)] transition-colors disabled:opacity-40"
                >
                  −
                </button>
                <button
                  onClick={() => onStockChange(product, 1)}
                  className="w-7 h-7 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-charcoal-muted)] flex items-center justify-center hover:bg-[var(--color-rose-light)] transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
