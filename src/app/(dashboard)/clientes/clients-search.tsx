'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MagnifyingGlass, Phone, EnvelopeSimple, CaretRight } from '@phosphor-icons/react'
import type { Client } from '@/types'

export default function ClientsSearch({ clients }: { clients: Client[] }) {
  const [query, setQuery] = useState('')

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.phone?.includes(query) ||
    c.email?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      {/* Buscador */}
      <div className="relative mb-4">
        <MagnifyingGlass
          size={16}
          weight="light"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-charcoal-subtle)]"
        />
        <input
          type="search"
          placeholder="Buscar por nombre, teléfono..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-[var(--color-rose-border)] bg-[var(--color-surface)] text-sm text-[var(--color-charcoal)] placeholder:text-[var(--color-charcoal-subtle)] outline-none transition-all focus:border-[var(--color-rose-nude)] focus:ring-2 focus:ring-[var(--color-rose-nude)]/20"
        />
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] px-5 py-10 text-center">
          <p className="text-sm text-[var(--color-charcoal-muted)]">
            {query ? 'Sin resultados para tu búsqueda' : 'Todavía no hay clientes registrados'}
          </p>
          {!query && (
            <Link
              href="/clientes/nuevo"
              className="text-xs text-[var(--color-rose-nude-hover)] font-medium mt-2 inline-block"
            >
              Agregar el primero
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
          {filtered.map((client) => (
            <Link
              key={client.id}
              href={`/clientes/${client.id}`}
              className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--color-background)] active:bg-[var(--color-rose-light)]"
            >
              {/* Avatar inicial */}
              <div className="w-9 h-9 rounded-full bg-[var(--color-rose-light)] flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-[var(--color-rose-dark)]">
                  {client.name.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-charcoal)] truncate">{client.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {client.phone && (
                    <span className="flex items-center gap-1 text-xs text-[var(--color-charcoal-muted)]">
                      <Phone size={11} weight="light" />
                      {client.phone}
                    </span>
                  )}
                  {client.email && (
                    <span className="flex items-center gap-1 text-xs text-[var(--color-charcoal-subtle)] truncate">
                      <EnvelopeSimple size={11} weight="light" />
                      {client.email}
                    </span>
                  )}
                </div>
              </div>

              <CaretRight size={14} weight="light" className="text-[var(--color-charcoal-subtle)] flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
