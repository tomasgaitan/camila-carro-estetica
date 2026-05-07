import { createClient } from '@/lib/supabase/server'
import ServicesCrud from './services-crud'
import type { Service } from '@/types'

export default async function ServiciosPage() {
  const supabase = await createClient()
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('name')

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6 pt-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-charcoal)]">Servicios</h1>
        <p className="text-sm text-[var(--color-charcoal-muted)] mt-0.5">
          {services?.filter((s) => s.active).length ?? 0} activos
        </p>
      </div>
      <ServicesCrud services={(services as Service[]) ?? []} />
    </div>
  )
}
