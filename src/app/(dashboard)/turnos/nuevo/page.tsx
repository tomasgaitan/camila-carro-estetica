import { createClient } from '@/lib/supabase/server'
import NewAppointmentForm from './new-appointment-form'
import type { Client, Service, Product } from '@/types'

export default async function NuevoTurnoPage() {
  const supabase = await createClient()

  const [{ data: clients }, { data: services }, { data: products }] = await Promise.all([
    supabase.from('clients').select('id, name, phone').order('name'),
    supabase.from('services').select('*').eq('active', true).order('name'),
    supabase.from('products').select('*').eq('active', true).order('name'),
  ])

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6 pt-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-charcoal)]">Nuevo turno</h1>
        <p className="text-sm text-[var(--color-charcoal-muted)] mt-0.5">Completá los datos del turno</p>
      </div>
      <NewAppointmentForm
        clients={(clients as Pick<Client, 'id' | 'name' | 'phone'>[]) ?? []}
        services={(services as Service[]) ?? []}
        products={(products as Product[]) ?? []}
      />
    </div>
  )
}
