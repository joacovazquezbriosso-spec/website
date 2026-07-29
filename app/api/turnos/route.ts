import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido' }, { status: 400 })
  }

  const { barberoId, servicioId, clienteNombre, clienteTel, fecha, hora } = body

  if (!barberoId || !servicioId || !clienteNombre || !clienteTel || !fecha || !hora) {
    return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
  }

  try {
    const turno = await prisma.$transaction(async (tx) => {
      const existing = await tx.turno.findFirst({
        where: { barberoId: Number(barberoId), fecha: String(fecha), hora: String(hora), estado: { not: 'cancelado' } },
      })

      if (existing) throw new Error('SLOT_TAKEN')

      return tx.turno.create({
        data: {
          barberoId: Number(barberoId),
          servicioId: Number(servicioId),
          clienteNombre: String(clienteNombre),
          clienteTel: String(clienteTel),
          fecha: String(fecha),
          hora: String(hora),
        },
      })
    })

    resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'Gastonnervi6@gmail.com',
      subject: `Nueva reserva - ${clienteNombre}`,
      html: `
        <h2>Nueva reserva en Barbería Nueve Ocho</h2>
        <p><strong>Cliente:</strong> ${clienteNombre}</p>
        <p><strong>Teléfono:</strong> ${clienteTel}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <p><strong>Hora:</strong> ${hora}</p>
      `,
    }).catch(() => {})

    return NextResponse.json(turno, { status: 201 })
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'SLOT_TAKEN') {
      return NextResponse.json({ error: 'El horario ya fue reservado. Elegí otro.' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Error al crear el turno' }, { status: 500 })
  }
}
