import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAvailableSlots } from '@/lib/slots'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const barberoId = parseInt(searchParams.get('barberoId') ?? '', 10)
  const fecha = searchParams.get('fecha')
  const servicioId = parseInt(searchParams.get('servicioId') ?? '', 10)

  if (isNaN(barberoId) || !fecha || isNaN(servicioId)) {
    return NextResponse.json({ error: 'Parámetros requeridos: barberoId, fecha, servicioId' }, { status: 400 })
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return NextResponse.json({ error: 'fecha debe tener formato YYYY-MM-DD' }, { status: 400 })
  }

  const [y, mo, d] = fecha.split('-').map(Number)
  const diaSemana = new Date(y, mo - 1, d).getDay()
  if (diaSemana === 0 || diaSemana === 1) {
    return NextResponse.json({ slots: [] })
  }

  try {
    const servicio = await prisma.servicio.findUnique({ where: { id: servicioId } })
    if (!servicio) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    const turnosDelDia = await prisma.turno.findMany({
      where: { barberoId, fecha, estado: { not: 'cancelado' } },
      select: { hora: true, servicio: { select: { duracion: true } } },
    })

    const existingSlots = turnosDelDia.map((t) => ({
      hora: t.hora,
      duracion: t.servicio.duracion,
    }))

    const slots = getAvailableSlots(existingSlots, servicio.duracion)
    return NextResponse.json({ slots })
  } catch {
    return NextResponse.json({ error: 'Error al obtener disponibilidad' }, { status: 500 })
  }
}
