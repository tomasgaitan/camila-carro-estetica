'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Appointment } from '@/types'

const DAYS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

export default function AgendaCalendar({
  appointments,
  currentMonth,
}: {
  appointments: Appointment[]
  currentMonth: string
}) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  const [year, month] = currentMonth.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const today = new Date().toISOString().split('T')[0]

  const appointmentsByDate = appointments.reduce<Record<string, Appointment[]>>((acc, appt) => {
    if (!acc[appt.date]) acc[appt.date] = []
    acc[appt.date].push(appt)
    return acc
  }, {})

  const selectedAppointments = appointmentsByDate[selectedDate] ?? []

  function buildDate(day: number) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  return (
    <>
      {/* Grilla del calendario */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 mb-4">
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-[var(--color-charcoal-subtle)] py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dateStr = buildDate(day)
            const hasAppts = !!appointmentsByDate[dateStr]?.length
            const isToday = dateStr === today
            const isSelected = dateStr === selectedDate
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`relative flex flex-col items-center justify-center h-10 rounded-xl text-sm transition-all ${
                  isSelected
                    ? 'bg-[var(--color-rose-nude)] text-white'
                    : isToday
                    ? 'bg-[var(--color-rose-light)] text-[var(--color-rose-dark)] font-semibold'
                    : 'text-[var(--color-charcoal)] hover:bg-[var(--color-background)]'
                }`}
              >
                {day}
                {hasAppts && (
                  <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-white/70' : 'bg-[var(--color-rose-nude)]'}`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Turnos del día seleccionado */}
      <div>
        <p className="text-sm font-semibold text-[var(--color-charcoal)] mb-3">
          {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>

        {selectedAppointments.length === 0 ? (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] px-5 py-8 text-center">
            <p className="text-sm text-[var(--color-charcoal-muted)]">No hay turnos este día</p>
            <Link
              href="/turnos/nuevo"
              className="text-xs text-[var(--color-rose-nude-hover)] font-medium mt-2 inline-block"
            >
              Agregar turno
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedAppointments.map((appt) => (
              <Link
                key={appt.id}
                href={`/turnos/${appt.id}`}
                className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] px-4 py-3.5 flex items-center gap-3 transition-all hover:border-[var(--color-rose-border)] active:scale-[0.99]"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  appt.status === 'completed' ? 'bg-[var(--color-success)]' :
                  appt.status === 'cancelled' ? 'bg-[var(--color-error)]' :
                  'bg-[var(--color-rose-nude)]'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-charcoal)] truncate">
                    {appt.client?.name ?? 'Sin cliente'}
                  </p>
                  <p className="text-xs text-[var(--color-charcoal-muted)] mt-0.5">
                    {appt.start_time.slice(0, 5)} — {appt.end_time.slice(0, 5)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
