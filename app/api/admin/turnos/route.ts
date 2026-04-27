import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fecha = searchParams.get('fecha')
  const barberoId = searchParams.get('barberoId')

  const where: Record<string, unknown> = {}
  if (fecha) where.fecha = fecha
  if (barberoId) {
    const parsed = parseInt(barberoId, 10)
    if (!isNaN(parsed)) where.barberoId = parsed
  }

  try {
    const turnos = await prisma.turno.findMany({
      where,
      include: {
        barbero: { select: { nombre: true } },
        servicio: { select: { nombre: true } },
      },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    })
    return NextResponse.json(turnos)
  } catch {
    return NextResponse.json({ error: 'Error al obtener turnos' }, { status: 500 })
  }
}
