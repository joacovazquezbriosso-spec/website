import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAvailableSlots } from '@/lib/slots'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const barberoId = Number(searchParams.get('barberoId'))
  const fecha = searchParams.get('fecha')
  const servicioId = Number(searchParams.get('servicioId'))

  if (!barberoId || !fecha || !servicioId) {
    return NextResponse.json({ error: 'Parámetros requeridos: barberoId, fecha, servicioId' }, { status: 400 })
  }

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
}
