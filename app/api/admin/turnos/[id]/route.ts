import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_ESTADOS = ['pendiente', 'confirmado', 'cancelado']

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let body: { estado?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const { estado } = body
  if (!estado || !VALID_ESTADOS.includes(estado)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  try {
    const { id } = await params
    const turno = await prisma.turno.update({
      where: { id: parseInt(id, 10) },
      data: { estado },
    })
    return NextResponse.json(turno)
  } catch (e: unknown) {
    const isNotFound = e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2025'
    if (isNotFound) return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 })
    return NextResponse.json({ error: 'Error al actualizar turno' }, { status: 500 })
  }
}
