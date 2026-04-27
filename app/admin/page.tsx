'use client'

import { useCallback, useEffect, useState } from 'react'

interface Turno {
  id: number
  clienteNombre: string
  clienteTel: string
  fecha: string
  hora: string
  estado: string
  barbero: { nombre: string }
  servicio: { nombre: string }
}

const ESTADOS = ['pendiente', 'confirmado', 'cancelado']
const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'text-yellow-500',
  confirmado: 'text-green-500',
  cancelado: 'text-red-500/60',
}

export default function AdminPanel() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadTurnos = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/turnos?fecha=${fecha}`)
      if (!res.ok) { setError('Error al cargar turnos'); setTurnos([]); return }
      const data = await res.json()
      setTurnos(data)
    } catch {
      setError('Error de conexión')
      setTurnos([])
    } finally {
      setLoading(false)
    }
  }, [fecha])

  async function updateEstado(id: number, estado: string) {
    try {
      const res = await fetch(`/api/admin/turnos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      })
      if (!res.ok) { setError('Error al actualizar estado'); return }
      await loadTurnos()
    } catch {
      setError('Error de conexión')
    }
  }

  useEffect(() => { loadTurnos() }, [loadTurnos])

  return (
    <div className="min-h-screen bg-dark text-cream px-8 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="font-cormorant text-gold text-xs tracking-widest2 uppercase mb-1">Panel Admin</p>
            <h1 className="font-gothic text-3xl">Turnos</h1>
          </div>
          <a href="/" className="font-cormorant text-dark-muted text-sm hover:text-cream transition-colors">
            Ver sitio →
          </a>
        </div>

        {/* Filter by date */}
        <div className="flex items-center gap-4 mb-8">
          <label htmlFor="fecha-filter" className="font-cormorant text-gold text-xs tracking-widest2 uppercase">Fecha</label>
          <input
            id="fecha-filter"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="bg-transparent border border-dark-border text-cream font-cormorant px-4 py-2 focus:border-gold outline-none"
          />
        </div>

        {error && <p className="font-cormorant text-red-400 text-sm mb-4">{error}</p>}

        {/* Table */}
        {loading ? (
          <p className="font-cormorant text-dark-muted">Cargando...</p>
        ) : turnos.length === 0 ? (
          <p className="font-cormorant text-dark-muted">No hay turnos para esta fecha.</p>
        ) : (
          <div className="border border-dark-border">
            <table className="w-full font-cormorant text-sm">
              <thead>
                <tr className="border-b border-dark-border">
                  {['Hora', 'Cliente', 'Teléfono', 'Barbero', 'Servicio', 'Estado', 'Acción'].map((h) => (
                    <th key={h} className="text-left text-gold text-xs tracking-widest uppercase px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {turnos.map((t) => (
                  <tr key={t.id} className="border-b border-dark-border/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-gold">{t.hora}</td>
                    <td className="px-4 py-3">{t.clienteNombre}</td>
                    <td className="px-4 py-3 text-dark-muted">{t.clienteTel}</td>
                    <td className="px-4 py-3">{t.barbero.nombre}</td>
                    <td className="px-4 py-3 text-dark-muted">{t.servicio.nombre}</td>
                    <td className={`px-4 py-3 capitalize ${ESTADO_COLORS[t.estado]}`}>{t.estado}</td>
                    <td className="px-4 py-3">
                      <select
                        value={t.estado}
                        onChange={(e) => updateEstado(t.id, e.target.value)}
                        aria-label={`Estado para ${t.clienteNombre}`}
                        className="bg-dark border border-dark-border text-cream text-xs px-2 py-1 focus:border-gold outline-none"
                      >
                        {ESTADOS.map((e) => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
