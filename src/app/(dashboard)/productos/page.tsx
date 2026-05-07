import { createClient } from '@/lib/supabase/server'
import ProductsCrud from './products-crud'
import type { Product } from '@/types'

export default async function ProductosPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('name')

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6 pt-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-charcoal)]">Productos</h1>
        <p className="text-sm text-[var(--color-charcoal-muted)] mt-0.5">
          {products?.filter((p) => p.active).length ?? 0} activos
        </p>
      </div>
      <ProductsCrud products={(products as Product[]) ?? []} />
    </div>
  )
}
