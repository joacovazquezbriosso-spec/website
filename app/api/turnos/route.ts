import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { barberoId, servicioId, clienteNombre, clienteTel, fecha, hora } = body

  if (!barberoId || !servicioId || !clienteNombre || !clienteTel || !fecha || !hora) {
    return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
  }

  try {
    const turno = await prisma.$transaction(async (tx) => {
      const existing = await tx.turno.findFirst({
        where: { barberoId, fecha, hora, estado: { not: 'cancelado' } },
      })
      if (existing) throw new Error('SLOT_TAKEN')

      return tx.turno.create({
        data: { barberoId, servicioId, clienteNombre, clienteTel, fecha, hora },
      })
    })

    return NextResponse.json(turno, { status: 201 })
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'SLOT_TAKEN') {
      return NextResponse.json({ error: 'El horario ya fue reservado. Elegí otro.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error al crear el turno' }, { status: 500 })
  }
}
