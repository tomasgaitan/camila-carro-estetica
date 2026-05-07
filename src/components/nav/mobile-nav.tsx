'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  House,
  CalendarDots,
  Users,
  Sparkle,
  ChartBar,
  SignOut,
} from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/', label: 'Inicio', icon: House },
  { href: '/agenda', label: 'Agenda', icon: CalendarDots },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/servicios', label: 'Servicios', icon: Sparkle },
  { href: '/reportes', label: 'Reportes', icon: ChartBar },
]

export default function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between px-5 h-14">
          <div>
            <p className="text-xs tracking-[0.18em] uppercase text-[var(--color-charcoal-muted)] font-medium leading-none">
              Camila Carro
            </p>
            <p className="text-[10px] tracking-widest uppercase text-[var(--color-charcoal-subtle)] leading-none mt-0.5">
              Estética
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-[var(--color-charcoal-muted)] hover:text-[var(--color-charcoal)] transition-colors py-2"
          >
            <SignOut size={16} weight="light" />
            Salir
          </button>
        </div>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)]/90 backdrop-blur-md border-t border-[var(--color-border)] pb-safe">
        <div className="flex items-center justify-around px-2 h-16">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 ${
                  active
                    ? 'text-[var(--color-rose-dark)]'
                    : 'text-[var(--color-charcoal-subtle)] hover:text-[var(--color-charcoal-muted)]'
                }`}
              >
                <div className={`relative p-1.5 rounded-lg transition-colors ${
                  active ? 'bg-[var(--color-rose-light)]' : ''
                }`}>
                  <Icon size={20} weight={active ? 'fill' : 'light'} />
                </div>
                <span className={`text-[10px] leading-none font-medium ${
                  active ? 'text-[var(--color-rose-dark)]' : ''
                }`}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
