import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { UserPlus, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr'
import type { Client } from '@/types'
import ClientsSearch from './clients-search'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('name')

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6 pt-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-charcoal)]">Clientes</h1>
          <p className="text-sm text-[var(--color-charcoal-muted)] mt-0.5">
            {clients?.length ?? 0} registrados
          </p>
        </div>
        <Link
          href="/clientes/nuevo"
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.97]"
        >
          <UserPlus size={16} weight="light" />
          Nuevo
        </Link>
      </div>

      <ClientsSearch clients={(clients as Client[]) ?? []} />
    </div>
  )
}
