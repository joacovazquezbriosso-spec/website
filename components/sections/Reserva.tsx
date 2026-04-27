'use client'

import { useState } from 'react'
import Image from 'next/image'
import SectionLabel from '@/components/ui/SectionLabel'
import GoldDivider from '@/components/ui/GoldDivider'
import type { Barbero, Servicio } from '@/lib/types'

interface ReservaProps {
  barberos: Barbero[]
  servicios: Servicio[]
}

type Step = 1 | 2 | 3 | 'done'

export default function Reserva({ barberos, servicios }: ReservaProps) {
  const [step, setStep] = useState<Step>(1)
  const [barberoId, setBarberoId] = useState<number | null>(null)
  const [servicioId, setServicioId] = useState<number | null>(null)
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [nombre, setNombre] = useState('')
  const [tel, setTel] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  async function fetchSlots(bId: number, sId: number, f: string) {
    if (!bId || !sId || !f) return
    setLoadingSlots(true)
    setHora('')
    try {
      const res = await fetch(`/api/disponibilidad?barberoId=${bId}&servicioId=${sId}&fecha=${f}`)
      const data = await res.json()
      setSlots(data.slots || [])
    } catch {
      setSlots([])
    }
    setLoadingSlots(false)
  }

  async function handleConfirmar() {
    if (!nombre.trim() || !tel.trim()) { setError('Completá nombre y teléfono'); return }
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberoId, servicioId, clienteNombre: nombre, clienteTel: tel, fecha, hora }),
      })
      const data = await res.json()
      if (res.ok) {
        setStep('done')
      } else {
        setError(data.error || 'Error al reservar. Intentá de nuevo.')
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setStep(1)
    setBarberoId(null)
    setServicioId(null)
    setFecha('')
    setHora('')
    setSlots([])
    setLoadingSlots(false)
    setNombre('')
    setTel('')
    setError('')
  }

  if (step === 'done') {
    return (
      <section id="reservar" className="bg-dark py-28 px-8 border-t border-dark-border">
        <div className="max-w-xl mx-auto text-center">
          <GoldDivider className="mx-auto mb-8" />
          <h2 className="font-gothic text-4xl text-cream mb-4">Turno Confirmado</h2>
          <p className="font-cormorant text-cream/70 text-lg">
            Te esperamos el {fecha} a las {hora} hs.<br />
            Nos vemos en Barbería Nueve Ocho.
          </p>
          <button
            onClick={resetForm}
            className="mt-10 font-cormorant text-gold text-sm tracking-widest2 uppercase border border-gold/30 px-8 py-3 hover:border-gold transition-colors"
          >
            Hacer otra reserva
          </button>
        </div>
      </section>
    )
  }

  return (
    <section id="reservar" className="bg-dark py-28 px-8 border-t border-dark-border">
      <div className="max-w-2xl mx-auto">
        <SectionLabel number="05" label="Reservar Turno" />

        {/* Step indicator */}
        <div className="flex items-center gap-4 mb-16">
          {([1, 2, 3] as const).map((s) => (
            <div key={s} className="flex items-center gap-4">
              <div className={`w-6 h-6 flex items-center justify-center text-xs font-cormorant border ${
                step === s
                  ? 'border-gold text-gold'
                  : (step as number) > s
                  ? 'border-gold/50 text-gold/50'
                  : 'border-dark-border text-dark-muted'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`h-px w-12 ${(step as number) > s ? 'bg-gold/40' : 'bg-dark-border'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Choose barber */}
        {step === 1 && (
          <div>
            <h3 className="font-cormorant text-cream text-2xl tracking-widest uppercase mb-8">
              Elegí tu barbero
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {barberos.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setBarberoId(b.id); setStep(2) }}
                  className={`p-6 border text-center transition-colors hover:border-gold group ${
                    barberoId === b.id ? 'border-gold' : 'border-dark-border'
                  }`}
                >
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gold/30 mx-auto mb-4">
                    <Image src={b.foto} alt={b.nombre} fill className="object-cover" />
                  </div>
                  <p className="font-cormorant text-cream tracking-widest uppercase text-sm">{b.nombre}</p>
                  <p className="font-cormorant text-gold text-xs mt-1">{b.especialidad}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Service, date, time */}
        {step === 2 && (
          <div className="space-y-8">
            <h3 className="font-cormorant text-cream text-2xl tracking-widest uppercase">
              Elegí servicio, fecha y horario
            </h3>

            {/* Servicio */}
            <div>
              <label className="font-cormorant text-gold text-xs tracking-widest2 uppercase block mb-3">Servicio</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {servicios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setServicioId(s.id)
                      if (fecha) fetchSlots(barberoId ?? 0, s.id, fecha)
                    }}
                    className={`p-4 border text-left transition-colors hover:border-gold ${
                      servicioId === s.id ? 'border-gold' : 'border-dark-border'
                    }`}
                  >
                    <span className="font-cormorant text-cream text-sm tracking-wide uppercase">{s.nombre}</span>
                    <span className="font-cormorant text-gold text-sm float-right">${s.precio.toLocaleString('es-AR')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fecha */}
            <div>
              <label className="font-cormorant text-gold text-xs tracking-widest2 uppercase block mb-3">Fecha</label>
              <input
                type="date"
                min={today}
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value)
                  if (servicioId) fetchSlots(barberoId ?? 0, servicioId, e.target.value)
                }}
                className="w-full bg-transparent border border-dark-border text-cream font-cormorant px-4 py-3 focus:border-gold outline-none transition-colors"
              />
            </div>

            {/* Horario */}
            {fecha && servicioId && (
              <div>
                <label className="font-cormorant text-gold text-xs tracking-widest2 uppercase block mb-3">
                  {loadingSlots ? 'Cargando horarios...' : 'Horario disponible'}
                </label>
                {!loadingSlots && slots.length === 0 && (
                  <p className="font-cormorant text-dark-muted text-sm">No hay horarios disponibles para ese día.</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <button
                      key={s}
                      onClick={() => setHora(s)}
                      className={`font-cormorant text-sm px-4 py-2 border transition-colors ${
                        hora === s ? 'border-gold text-gold' : 'border-dark-border text-cream hover:border-gold/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setStep(1)}
                className="font-cormorant text-dark-muted text-sm tracking-widest2 uppercase hover:text-cream transition-colors"
              >
                ← Volver
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!servicioId || !fecha || !hora}
                className="font-cormorant text-sm tracking-widest2 uppercase px-8 py-3 border border-gold text-gold hover:bg-gold hover:text-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Personal data + confirm */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="font-cormorant text-cream text-2xl tracking-widest uppercase">
              Tus datos
            </h3>

            {/* Booking summary */}
            <div className="bg-dark-border/20 border border-dark-border p-6 space-y-1">
              <p className="font-cormorant text-cream/60 text-sm">
                {barberos.find(b => b.id === barberoId)?.nombre} · {servicios.find(s => s.id === servicioId)?.nombre}
              </p>
              <p className="font-cormorant text-gold">
                {fecha} — {hora} hs
              </p>
            </div>

            <div>
              <label className="font-cormorant text-gold text-xs tracking-widest2 uppercase block mb-2">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full bg-transparent border border-dark-border text-cream font-cormorant px-4 py-3 focus:border-gold outline-none transition-colors placeholder:text-dark-muted"
              />
            </div>

            <div>
              <label className="font-cormorant text-gold text-xs tracking-widest2 uppercase block mb-2">Teléfono</label>
              <input
                type="tel"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                placeholder="+54 9 11 0000-0000"
                className="w-full bg-transparent border border-dark-border text-cream font-cormorant px-4 py-3 focus:border-gold outline-none transition-colors placeholder:text-dark-muted"
              />
            </div>

            {error && (
              <p className="font-cormorant text-red-400 text-sm">{error}</p>
            )}

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setStep(2)}
                className="font-cormorant text-dark-muted text-sm tracking-widest2 uppercase hover:text-cream transition-colors"
              >
                ← Volver
              </button>
              <button
                onClick={handleConfirmar}
                disabled={submitting}
                className="font-cormorant text-sm tracking-widest2 uppercase px-8 py-3 bg-gold text-dark hover:bg-gold/80 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Confirmando...' : 'Confirmar Turno'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
