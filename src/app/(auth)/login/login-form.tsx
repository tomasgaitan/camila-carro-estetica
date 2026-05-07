'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeSlash } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-[var(--color-charcoal-soft)]">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="hola@ejemplo.com"
          className="w-full h-11 px-4 rounded-xl border border-[var(--color-rose-border)] bg-[var(--color-surface)] text-[var(--color-charcoal)] placeholder:text-[var(--color-charcoal-subtle)] text-sm outline-none transition-all focus:border-[var(--color-rose-nude)] focus:ring-2 focus:ring-[var(--color-rose-nude)]/20"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-[var(--color-charcoal-soft)]">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-11 px-4 pr-11 rounded-xl border border-[var(--color-rose-border)] bg-[var(--color-surface)] text-[var(--color-charcoal)] placeholder:text-[var(--color-charcoal-subtle)] text-sm outline-none transition-all focus:border-[var(--color-rose-nude)] focus:ring-2 focus:ring-[var(--color-rose-nude)]/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-charcoal-subtle)] hover:text-[var(--color-charcoal-muted)] transition-colors"
          >
            {showPassword
              ? <EyeSlash size={18} weight="light" />
              : <Eye size={18} weight="light" />
            }
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-[var(--color-error)] bg-[var(--color-error-light)] px-4 py-3 rounded-xl">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium tracking-wide transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}
