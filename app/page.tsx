import { prisma } from '@/lib/prisma'
import Hero from '@/components/sections/Hero'
import Servicios from '@/components/sections/Servicios'
import Galeria from '@/components/sections/Galeria'
import Equipo from '@/components/sections/Equipo'
import Reserva from '@/components/sections/Reserva'
import Contacto from '@/components/sections/Contacto'

export default async function Home() {
  const [barberos, servicios] = await Promise.all([
    prisma.barbero.findMany({ where: { activo: true }, orderBy: { id: 'asc' } }),
    prisma.servicio.findMany({ where: { activo: true }, orderBy: { id: 'asc' } }),
  ])

  return (
    <main>
      <Hero />
      <Servicios servicios={servicios} />
      <Galeria />
      <Equipo barberos={barberos} />
      <Reserva barberos={barberos} servicios={servicios} />
      <Contacto />
    </main>
  )
}
