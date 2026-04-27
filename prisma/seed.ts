import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbUrl = process.env.DATABASE_URL?.replace('file:', '') ?? './dev.db'
const dbPath = path.resolve(process.cwd(), dbUrl)
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.barbero.createMany({
    data: [
      { nombre: 'Martín', especialidad: 'Cortes Clásicos', foto: 'https://i.pravatar.cc/300?img=11' },
      { nombre: 'Lucas', especialidad: 'Afeitado & Barba', foto: 'https://i.pravatar.cc/300?img=14' },
      { nombre: 'Nicolás', especialidad: 'Diseño & Color', foto: 'https://i.pravatar.cc/300?img=18' },
    ],
  })

  await prisma.servicio.createMany({
    data: [
      { nombre: 'Corte', precio: 500, duracion: 30 },
      { nombre: 'Barba', precio: 300, duracion: 20 },
      { nombre: 'Corte + Barba', precio: 700, duracion: 45 },
      { nombre: 'Mechas + Corte', precio: 1790, duracion: 90 },
    ],
  })

  console.log('seeded')
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1) })
