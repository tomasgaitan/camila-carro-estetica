import { FlowerLotus } from '@phosphor-icons/react/dist/ssr'
import LoginForm from './login-form'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] bg-[var(--color-background)] flex flex-col items-center justify-center px-6">
      {/* Logo area */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="w-16 h-16 rounded-full bg-[var(--color-rose-light)] flex items-center justify-center">
          <FlowerLotus size={32} weight="light" className="text-[var(--color-rose-dark)]" />
        </div>
        <div className="text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-charcoal-muted)] font-medium">
            Camila Carro
          </p>
          <p className="text-xs tracking-widest uppercase text-[var(--color-charcoal-subtle)]">
            Estética
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-charcoal)] mb-1">
          Bienvenida
        </h1>
        <p className="text-sm text-[var(--color-charcoal-muted)] mb-8">
          Ingresá para acceder al panel
        </p>

        <LoginForm />
      </div>
    </div>
  )
}
