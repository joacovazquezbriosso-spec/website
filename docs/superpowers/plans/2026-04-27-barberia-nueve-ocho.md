# Barbería Nueve Ocho — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium barbershop landing page with integrated online booking system where clients select barber, service, date and time slot, and appointments are saved to a database.

**Architecture:** Next.js 14 App Router — server components fetch initial data (barberos, servicios) from Prisma and pass it as props to client components. Booking form is fully client-side with dynamic slot fetching. Admin panel at `/admin` is protected by middleware and session cookie.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Prisma, PostgreSQL (Vercel Postgres in prod / SQLite in dev), yet-another-react-lightbox, Jest

---

## File Map

```
barberia-nueve-ocho/
├── app/
│   ├── layout.tsx                        ← Google Fonts, metadata, global wrapper
│   ├── globals.css                       ← Tailwind directives + CSS custom properties
│   ├── page.tsx                          ← Server component: fetches barberos+servicios, composes sections
│   ├── admin/
│   │   ├── login/page.tsx               ← Public login form
│   │   └── page.tsx                     ← Protected turnos panel
│   └── api/
│       ├── barberos/route.ts            ← GET active barberos
│       ├── servicios/route.ts           ← GET active servicios
│       ├── disponibilidad/route.ts      ← GET available slots for barbero+fecha+servicio
│       ├── turnos/route.ts              ← POST create turno (with race condition guard)
│       └── admin/
│           ├── login/route.ts           ← POST login → set session cookie
│           └── turnos/
│               ├── route.ts            ← GET all turnos with filters
│               └── [id]/route.ts       ← PATCH estado
├── components/
│   ├── ui/
│   │   ├── GoldDivider.tsx             ← <hr> styled gold thin line
│   │   └── SectionLabel.tsx            ← "01 — LABEL" in gold uppercase
│   └── sections/
│       ├── Hero.tsx                    ← Logo, tagline, CTA button
│       ├── Servicios.tsx               ← Grid of service cards with price
│       ├── Galeria.tsx                 ← Photo grid + lightbox (client)
│       ├── Equipo.tsx                  ← Barber cards with circular photo
│       ├── Reserva.tsx                 ← 3-step booking form (client)
│       └── Contacto.tsx               ← Address, hours, map, footer
├── lib/
│   ├── prisma.ts                       ← Prisma singleton
│   ├── slots.ts                        ← Pure function: compute available time slots
│   └── auth.ts                         ← Session token helpers
├── middleware.ts                        ← Protects /admin/* (except /admin/login)
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                         ← 3 barberos + 4 servicios placeholder data
├── public/
│   └── logo.png                        ← User replaces with real logo
├── __tests__/
│   └── slots.test.ts
├── .env.example
├── jest.config.ts
└── tailwind.config.ts
```

---

## Task 1: Project Setup & Dependencies

**Files:**
- Create: `package.json` (via create-next-app)
- Modify: `tailwind.config.ts`
- Create: `jest.config.ts`
- Create: `.env.example`
- Create: `.env.local`

- [ ] **Step 1: Scaffold Next.js project**

Run inside `c:\Users\59899\Documents\webb\`:

```bash
npx create-next-app@latest barberia-nueve-ocho \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
cd barberia-nueve-ocho
```

- [ ] **Step 2: Install dependencies**

```bash
npm install prisma @prisma/client yet-another-react-lightbox
npm install --save-dev jest jest-environment-node @types/jest ts-jest
```

- [ ] **Step 3: Initialize Prisma with SQLite for local dev**

```bash
npx prisma init --datasource-provider sqlite
```

- [ ] **Step 4: Configure Tailwind with brand colors**

Replace `tailwind.config.ts` with:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#c9a84c',
        cream: '#f5f0e8',
        dark: '#0d0d0d',
        'dark-border': '#222222',
        'dark-muted': '#666666',
      },
      fontFamily: {
        gothic: ['var(--font-gothic)'],
        cormorant: ['var(--font-cormorant)'],
      },
      letterSpacing: {
        widest2: '0.3em',
        widest3: '0.5em',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 5: Create Jest config**

Create `jest.config.ts`:

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'node',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
  testMatch: ['**/__tests__/**/*.test.ts'],
}

export default createJestConfig(config)
```

- [ ] **Step 6: Create .env.example and .env.local**

Create `.env.example`:

```env
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="cambiame"
ADMIN_SESSION_TOKEN="token-secreto-largo-aqui"
```

Create `.env.local` (gitignored):

```env
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="nueve98ocho"
ADMIN_SESSION_TOKEN="nO98x-session-2026"
```

- [ ] **Step 7: Add .env.local to .gitignore**

Verify `echo ".env.local" >> .gitignore` (already included by create-next-app but confirm).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: project setup, tailwind config, jest"
```

---

## Task 2: Database Schema, Prisma Client & Seed

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `lib/prisma.ts`
- Create: `prisma/seed.ts`

- [ ] **Step 1: Write schema.prisma**

Replace `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Barbero {
  id           Int      @id @default(autoincrement())
  nombre       String
  especialidad String
  foto         String
  activo       Boolean  @default(true)
  turnos       Turno[]
}

model Servicio {
  id       Int      @id @default(autoincrement())
  nombre   String
  precio   Int
  duracion Int
  activo   Boolean  @default(true)
  turnos   Turno[]
}

model Turno {
  id            Int      @id @default(autoincrement())
  barberoId     Int
  servicioId    Int
  clienteNombre String
  clienteTel    String
  fecha         String
  hora          String
  estado        String   @default("pendiente")
  creadoEn      DateTime @default(now())
  barbero       Barbero  @relation(fields: [barberoId], references: [id])
  servicio      Servicio @relation(fields: [servicioId], references: [id])
}
```

- [ ] **Step 2: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected: creates `prisma/migrations/` and `dev.db`.

- [ ] **Step 3: Create Prisma singleton**

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 4: Create seed script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.barbero.createMany({
    data: [
      {
        nombre: 'Martín',
        especialidad: 'Cortes Clásicos',
        foto: 'https://i.pravatar.cc/300?img=11',
      },
      {
        nombre: 'Lucas',
        especialidad: 'Afeitado & Barba',
        foto: 'https://i.pravatar.cc/300?img=14',
      },
      {
        nombre: 'Nicolás',
        especialidad: 'Diseño & Color',
        foto: 'https://i.pravatar.cc/300?img=18',
      },
    ],
  })

  await prisma.servicio.createMany({
    data: [
      { nombre: 'Corte Clásico', precio: 8000, duracion: 30 },
      { nombre: 'Afeitado Navaja', precio: 6000, duracion: 30 },
      { nombre: 'Corte + Barba', precio: 12000, duracion: 60 },
      { nombre: 'Tratamiento Capilar', precio: 9000, duracion: 45 },
    ],
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1) })
```

- [ ] **Step 5: Add seed script to package.json**

Add to `package.json`:

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Install ts-node:

```bash
npm install --save-dev ts-node
```

- [ ] **Step 6: Run seed**

```bash
npx prisma db seed
```

Expected: "Running seed command..." with no errors.

- [ ] **Step 7: Verify data in Prisma Studio**

```bash
npx prisma studio
```

Open `http://localhost:5555` — confirm 3 barberos and 4 servicios exist.

- [ ] **Step 8: Commit**

```bash
git add prisma/ lib/prisma.ts package.json
git commit -m "feat: prisma schema, migrations, seed data"
```

---

## Task 3: Slot Calculation Logic & Tests

**Files:**
- Create: `lib/slots.ts`
- Create: `__tests__/slots.test.ts`

- [ ] **Step 1: Write the failing tests first**

Create `__tests__/slots.test.ts`:

```typescript
import { getAvailableSlots } from '@/lib/slots'

describe('getAvailableSlots', () => {
  it('returns all 30-min slots from 09:00 to 19:30 when no turnos', () => {
    const slots = getAvailableSlots([], 30)
    expect(slots[0]).toBe('09:00')
    expect(slots[slots.length - 1]).toBe('19:30')
    expect(slots).toHaveLength(22)
  })

  it('excludes a slot occupied by an existing 30-min turno', () => {
    const slots = getAvailableSlots([{ hora: '10:00', duracion: 30 }], 30)
    expect(slots).not.toContain('10:00')
    expect(slots).toContain('09:30')
    expect(slots).toContain('10:30')
  })

  it('excludes all slots that overlap with a 60-min turno', () => {
    // turno at 10:00 for 60 min blocks 10:00 and 10:30
    const slots = getAvailableSlots([{ hora: '10:00', duracion: 60 }], 30)
    expect(slots).not.toContain('10:00')
    expect(slots).not.toContain('10:30')
    expect(slots).toContain('11:00')
  })

  it('respects service duration — 60-min service cannot start at 19:30', () => {
    const slots = getAvailableSlots([], 60)
    expect(slots).not.toContain('19:30')
    expect(slots[slots.length - 1]).toBe('19:00')
  })

  it('returns empty array when all slots are taken', () => {
    const turnos = []
    for (let h = 9; h < 20; h++) {
      for (const m of [0, 30]) {
        if (h === 19 && m === 30) continue
        turnos.push({ hora: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, duracion: 30 })
      }
    }
    const slots = getAvailableSlots(turnos, 30)
    expect(slots).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx jest __tests__/slots.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/slots'`

- [ ] **Step 3: Implement lib/slots.ts**

Create `lib/slots.ts`:

```typescript
export interface TurnoSlot {
  hora: string
  duracion: number
}

export function getAvailableSlots(
  existingTurnos: TurnoSlot[],
  duracion: number
): string[] {
  const OPEN = 9 * 60
  const CLOSE = 20 * 60

  const occupied = new Set<number>()
  for (const turno of existingTurnos) {
    const [h, m] = turno.hora.split(':').map(Number)
    const start = h * 60 + m
    for (let t = start; t < start + turno.duracion; t++) {
      occupied.add(t)
    }
  }

  const slots: string[] = []
  for (let t = OPEN; t + duracion <= CLOSE; t += 30) {
    let free = true
    for (let i = t; i < t + duracion; i++) {
      if (occupied.has(i)) { free = false; break }
    }
    if (free) {
      const h = Math.floor(t / 60).toString().padStart(2, '0')
      const m = (t % 60).toString().padStart(2, '0')
      slots.push(`${h}:${m}`)
    }
  }

  return slots
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx jest __tests__/slots.test.ts
```

Expected: PASS — 5 tests

- [ ] **Step 5: Commit**

```bash
git add lib/slots.ts __tests__/slots.test.ts jest.config.ts
git commit -m "feat: slot calculation logic with tests"
```

---

## Task 4: API Routes

**Files:**
- Create: `app/api/barberos/route.ts`
- Create: `app/api/servicios/route.ts`
- Create: `app/api/disponibilidad/route.ts`
- Create: `app/api/turnos/route.ts`

- [ ] **Step 1: GET /api/barberos**

Create `app/api/barberos/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const barberos = await prisma.barbero.findMany({
    where: { activo: true },
    orderBy: { id: 'asc' },
  })
  return NextResponse.json(barberos)
}
```

- [ ] **Step 2: GET /api/servicios**

Create `app/api/servicios/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const servicios = await prisma.servicio.findMany({
    where: { activo: true },
    orderBy: { id: 'asc' },
  })
  return NextResponse.json(servicios)
}
```

- [ ] **Step 3: GET /api/disponibilidad**

Create `app/api/disponibilidad/route.ts`:

```typescript
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
```

- [ ] **Step 4: POST /api/turnos**

Create `app/api/turnos/route.ts`:

```typescript
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
```

- [ ] **Step 5: Verify routes manually**

```bash
npm run dev
```

In another terminal:

```bash
curl http://localhost:3000/api/barberos
# Expected: [{"id":1,"nombre":"Martín",...}, ...]

curl http://localhost:3000/api/servicios
# Expected: [{"id":1,"nombre":"Corte Clásico","precio":8000,...}, ...]

curl "http://localhost:3000/api/disponibilidad?barberoId=1&fecha=2026-05-01&servicioId=1"
# Expected: {"slots":["09:00","09:30",...,"19:30"]}
```

- [ ] **Step 6: Commit**

```bash
git add app/api/
git commit -m "feat: API routes — barberos, servicios, disponibilidad, turnos"
```

---

## Task 5: Auth Helpers & Middleware

**Files:**
- Create: `lib/auth.ts`
- Create: `middleware.ts`
- Create: `app/api/admin/login/route.ts`

- [ ] **Step 1: Create auth helper**

Create `lib/auth.ts`:

```typescript
export const COOKIE_NAME = 'admin-session'

export function isValidSession(cookieValue: string | undefined): boolean {
  return cookieValue === process.env.ADMIN_SESSION_TOKEN
}
```

- [ ] **Step 2: Create middleware**

Create `middleware.ts` at the project root:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_NAME, isValidSession } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login') return NextResponse.next()

  const cookie = request.cookies.get(COOKIE_NAME)
  if (!isValidSession(cookie?.value)) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

- [ ] **Step 3: Create login API route**

Create `app/api/admin/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, process.env.ADMIN_SESSION_TOKEN!, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  return response
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/auth.ts middleware.ts app/api/admin/
git commit -m "feat: admin auth — middleware, session cookie, login route"
```

---

## Task 6: Admin Turnos API

**Files:**
- Create: `app/api/admin/turnos/route.ts`
- Create: `app/api/admin/turnos/[id]/route.ts`

- [ ] **Step 1: GET /api/admin/turnos**

Create `app/api/admin/turnos/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fecha = searchParams.get('fecha')
  const barberoId = searchParams.get('barberoId')

  const where: Record<string, unknown> = {}
  if (fecha) where.fecha = fecha
  if (barberoId) where.barberoId = Number(barberoId)

  const turnos = await prisma.turno.findMany({
    where,
    include: {
      barbero: { select: { nombre: true } },
      servicio: { select: { nombre: true } },
    },
    orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
  })

  return NextResponse.json(turnos)
}
```

- [ ] **Step 2: PATCH /api/admin/turnos/[id]**

Create `app/api/admin/turnos/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_ESTADOS = ['pendiente', 'confirmado', 'cancelado']

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { estado } = await request.json()

  if (!VALID_ESTADOS.includes(estado)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const turno = await prisma.turno.update({
    where: { id: Number(params.id) },
    data: { estado },
  })

  return NextResponse.json(turno)
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/turnos/
git commit -m "feat: admin turnos API — GET with filters, PATCH estado"
```

---

## Task 7: Global Layout & UI Primitives

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Create: `components/ui/GoldDivider.tsx`
- Create: `components/ui/SectionLabel.tsx`

- [ ] **Step 1: Update app/layout.tsx with fonts**

Replace `app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Cormorant_Garamond, Unifraktur_Maguntia } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const gothic = Unifraktur_Maguntia({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-gothic',
})

export const metadata: Metadata = {
  title: 'Barbería Nueve Ocho',
  description: 'Barbería premium en Buenos Aires. Reservá tu turno online.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${cormorant.variable} ${gothic.variable} bg-dark text-cream antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Update globals.css**

Replace `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --gold: #c9a84c;
  --cream: #f5f0e8;
  --dark: #0d0d0d;
}

html {
  scroll-behavior: smooth;
}

::selection {
  background: #c9a84c33;
  color: #f5f0e8;
}

::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: #0d0d0d;
}

::-webkit-scrollbar-thumb {
  background: #c9a84c44;
}
```

- [ ] **Step 3: Create GoldDivider**

Create `components/ui/GoldDivider.tsx`:

```typescript
export default function GoldDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`w-12 h-px bg-gold ${className}`} />
  )
}
```

- [ ] **Step 4: Create SectionLabel**

Create `components/ui/SectionLabel.tsx`:

```typescript
interface SectionLabelProps {
  number: string
  label: string
}

export default function SectionLabel({ number, label }: SectionLabelProps) {
  return (
    <p className="font-cormorant text-gold text-xs tracking-widest2 uppercase mb-12">
      {number} — {label}
    </p>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/globals.css components/
git commit -m "feat: global layout with fonts, GoldDivider, SectionLabel"
```

---

## Task 8: Hero Section

**Files:**
- Create: `components/sections/Hero.tsx`
- Create: `public/logo.png` (placeholder)

- [ ] **Step 1: Add placeholder logo**

Download any dark PNG as placeholder and save to `public/logo.png`. The user will replace this with the real logo file. Run:

```bash
curl -o public/logo.png "https://via.placeholder.com/600x300/0d0d0d/c9a84c?text=LOGO"
```

- [ ] **Step 2: Create Hero.tsx**

Create `components/sections/Hero.tsx`:

```typescript
import Image from 'next/image'
import GoldDivider from '@/components/ui/GoldDivider'

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-dark px-8 text-center">
      <div className="flex flex-col items-center gap-8 max-w-2xl">
        <Image
          src="/logo.png"
          alt="Barbería Nueve Ocho"
          width={480}
          height={240}
          priority
          className="w-full max-w-md"
        />

        <GoldDivider />

        <p className="font-cormorant italic text-cream/70 text-xl tracking-wide">
          Tradición. Precisión. Arte.
        </p>

        <a
          href="#reservar"
          className="mt-4 inline-block border border-gold text-gold font-cormorant text-sm tracking-widest2 uppercase px-10 py-3 hover:bg-gold hover:text-dark transition-colors duration-300"
        >
          Reservar Turno
        </a>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/sections/Hero.tsx public/logo.png
git commit -m "feat: Hero section"
```

---

## Task 9: Servicios Section

**Files:**
- Create: `components/sections/Servicios.tsx`

- [ ] **Step 1: Create Servicios.tsx**

Create `components/sections/Servicios.tsx`:

```typescript
import SectionLabel from '@/components/ui/SectionLabel'
import GoldDivider from '@/components/ui/GoldDivider'

interface Servicio {
  id: number
  nombre: string
  precio: number
  duracion: number
}

export default function Servicios({ servicios }: { servicios: Servicio[] }) {
  return (
    <section className="bg-dark py-28 px-8 border-t border-dark-border">
      <div className="max-w-3xl mx-auto">
        <SectionLabel number="02" label="Servicios" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-dark-border">
          {servicios.map((s) => (
            <div
              key={s.id}
              className="bg-dark p-8 flex justify-between items-start hover:bg-white/[0.02] transition-colors"
            >
              <div>
                <h3 className="font-cormorant text-cream text-lg tracking-widest uppercase">
                  {s.nombre}
                </h3>
                <p className="font-cormorant text-dark-muted text-sm mt-1">
                  {s.duracion} min
                </p>
              </div>
              <span className="font-cormorant text-gold text-lg">
                ${s.precio.toLocaleString('es-AR')}
              </span>
            </div>
          ))}
        </div>

        <GoldDivider className="mt-16 mx-auto" />
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/sections/Servicios.tsx
git commit -m "feat: Servicios section"
```

---

## Task 10: Galería Section

**Files:**
- Create: `components/sections/Galeria.tsx`

- [ ] **Step 1: Create Galeria.tsx with lightbox**

Create `components/sections/Galeria.tsx`:

```typescript
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import SectionLabel from '@/components/ui/SectionLabel'

const FOTOS = [
  { src: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80', alt: 'Corte 1' },
  { src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80', alt: 'Corte 2' },
  { src: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80', alt: 'Corte 3' },
  { src: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800&q=80', alt: 'Corte 4' },
  { src: 'https://images.unsplash.com/photo-1562004760-aceed7bb0fe3?w=800&q=80', alt: 'Corte 5' },
  { src: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&q=80', alt: 'Corte 6' },
]

export default function Galeria() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  return (
    <section className="bg-dark py-28 px-8 border-t border-dark-border">
      <div className="max-w-4xl mx-auto">
        <SectionLabel number="03" label="Galería" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
          {FOTOS.map((foto, i) => (
            <button
              key={i}
              onClick={() => { setIndex(i); setOpen(true) }}
              className="relative aspect-square overflow-hidden group"
            >
              <Image
                src={foto.src}
                alt={foto.alt}
                fill
                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-dark/20 group-hover:bg-transparent transition-colors" />
            </button>
          ))}
        </div>

        <Lightbox
          open={open}
          close={() => setOpen(false)}
          index={index}
          slides={FOTOS.map((f) => ({ src: f.src }))}
          styles={{ container: { backgroundColor: 'rgba(13,13,13,0.97)' } }}
        />
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Allow Unsplash images in next.config**

Modify `next.config.ts`:

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 3: Commit**

```bash
git add components/sections/Galeria.tsx next.config.ts
git commit -m "feat: Galería section with lightbox"
```

---

## Task 11: Equipo Section

**Files:**
- Create: `components/sections/Equipo.tsx`

- [ ] **Step 1: Create Equipo.tsx**

Create `components/sections/Equipo.tsx`:

```typescript
import Image from 'next/image'
import SectionLabel from '@/components/ui/SectionLabel'

interface Barbero {
  id: number
  nombre: string
  especialidad: string
  foto: string
}

export default function Equipo({ barberos }: { barberos: Barbero[] }) {
  return (
    <section className="bg-dark py-28 px-8 border-t border-dark-border">
      <div className="max-w-3xl mx-auto">
        <SectionLabel number="04" label="El Equipo" />

        <div className="flex flex-wrap justify-center gap-16">
          {barberos.map((b) => (
            <div key={b.id} className="flex flex-col items-center gap-4 text-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gold/40">
                <Image
                  src={b.foto}
                  alt={b.nombre}
                  fill
                  className="object-cover grayscale"
                />
              </div>
              <div>
                <h3 className="font-cormorant text-cream text-lg tracking-widest uppercase">
                  {b.nombre}
                </h3>
                <p className="font-cormorant text-gold text-sm tracking-wide mt-1">
                  {b.especialidad}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/sections/Equipo.tsx
git commit -m "feat: Equipo section"
```

---

## Task 12: Reserva Section (3-step booking form)

**Files:**
- Create: `components/sections/Reserva.tsx`

- [ ] **Step 1: Create Reserva.tsx**

Create `components/sections/Reserva.tsx`:

```typescript
'use client'

import { useState } from 'react'
import Image from 'next/image'
import SectionLabel from '@/components/ui/SectionLabel'
import GoldDivider from '@/components/ui/GoldDivider'

interface Barbero { id: number; nombre: string; especialidad: string; foto: string }
interface Servicio { id: number; nombre: string; precio: number; duracion: number }

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
    const res = await fetch(`/api/disponibilidad?barberoId=${bId}&servicioId=${sId}&fecha=${f}`)
    const data = await res.json()
    setSlots(data.slots || [])
    setLoadingSlots(false)
  }

  async function handleConfirmar() {
    if (!nombre.trim() || !tel.trim()) { setError('Completá nombre y teléfono'); return }
    setError('')
    setSubmitting(true)

    const res = await fetch('/api/turnos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barberoId, servicioId, clienteNombre: nombre, clienteTel: tel, fecha, hora }),
    })

    setSubmitting(false)

    if (res.ok) {
      setStep('done')
    } else {
      const data = await res.json()
      setError(data.error || 'Error al reservar. Intentá de nuevo.')
    }
  }

  if (step === 'done') {
    return (
      <section id="reservar" className="bg-dark py-28 px-8 border-t border-dark-border">
        <div className="max-w-xl mx-auto text-center">
          <GoldDivider className="mx-auto mb-8" />
          <h2 className="font-gothic text-4xl text-cream mb-4">Turno Confirmado</h2>
          <p className="font-cormorant text-cream/70 text-lg">
            Te esperamos el {fecha} a las {hora}.<br />
            Nos vemos en Barbería Nueve Ocho.
          </p>
          <button
            onClick={() => { setStep(1); setBarberoId(null); setServicioId(null); setFecha(''); setHora(''); setNombre(''); setTel('') }}
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
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-4">
              <div className={`w-6 h-6 flex items-center justify-center text-xs font-cormorant border ${
                step === s ? 'border-gold text-gold' : step > s ? 'border-gold/50 text-gold/50' : 'border-dark-border text-dark-muted'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`h-px w-12 ${step > s ? 'bg-gold/40' : 'bg-dark-border'}`} />}
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
                    <Image src={b.foto} alt={b.nombre} fill className="object-cover grayscale group-hover:grayscale-0 transition-all" />
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
                      if (fecha) fetchSlots(barberoId!, s.id, fecha)
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
                  if (servicioId) fetchSlots(barberoId!, servicioId, e.target.value)
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
```

- [ ] **Step 2: Commit**

```bash
git add components/sections/Reserva.tsx
git commit -m "feat: Reserva section — 3-step booking form"
```

---

## Task 13: Contacto Section & Footer

**Files:**
- Create: `components/sections/Contacto.tsx`

- [ ] **Step 1: Create Contacto.tsx**

Create `components/sections/Contacto.tsx`:

```typescript
import Image from 'next/image'
import SectionLabel from '@/components/ui/SectionLabel'

export default function Contacto() {
  return (
    <section className="bg-dark border-t border-dark-border">
      <div className="max-w-3xl mx-auto py-28 px-8">
        <SectionLabel number="06" label="Contacto" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
          <div className="space-y-6 font-cormorant">
            <div>
              <p className="text-gold text-xs tracking-widest2 uppercase mb-2">Dirección</p>
              <p className="text-cream text-lg">Av. Corrientes 1234</p>
              <p className="text-dark-muted">Buenos Aires, Argentina</p>
            </div>
            <div>
              <p className="text-gold text-xs tracking-widest2 uppercase mb-2">Horarios</p>
              <p className="text-cream text-lg">Lunes a Sábado</p>
              <p className="text-dark-muted">9:00 — 20:00 hs</p>
            </div>
            <div>
              <p className="text-gold text-xs tracking-widest2 uppercase mb-2">Contacto</p>
              <a href="https://wa.me/5491100000000" className="text-cream hover:text-gold transition-colors block">
                +54 9 11 0000-0000
              </a>
              <a href="https://instagram.com/barberianueveocho" className="text-cream hover:text-gold transition-colors block mt-1">
                @barberianueveocho
              </a>
            </div>
          </div>

          {/* Map */}
          <div className="aspect-square md:aspect-auto">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.016863498282!2d-58.38414492346188!3d-34.60373315736544!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccacfb2e54dbb%3A0x8dd3ef20a2c81f49!2sAv.%20Corrientes%201234%2C%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1682000000000!5m2!1ses!2sar"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 200, filter: 'grayscale(1) invert(0.9)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-dark-border py-8 px-8 text-center">
        <p className="font-cormorant text-dark-muted text-sm tracking-widest uppercase">
          © 2026 Barbería Nueve Ocho — Buenos Aires
        </p>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/sections/Contacto.tsx
git commit -m "feat: Contacto section with map and footer"
```

---

## Task 14: Landing Page Assembly

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Compose all sections in page.tsx**

Replace `app/page.tsx`:

```typescript
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
```

- [ ] **Step 2: Run dev server and verify the full page**

```bash
npm run dev
```

Open `http://localhost:3000` and verify:
- Hero loads with logo
- Servicios shows 4 cards with prices
- Galería shows 6 photos, click opens lightbox
- Equipo shows 3 barbers
- Reserva: click barber → select service/date/time → enter name+tel → confirm → success screen
- Contacto shows address, map, footer

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: landing page — compose all sections"
```

---

## Task 15: Admin Login Page

**Files:**
- Create: `app/admin/login/page.tsx`

- [ ] **Step 1: Create login page**

Create `app/admin/login/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setLoading(false)

    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Contraseña incorrecta')
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-8">
      <div className="w-full max-w-sm">
        <p className="font-cormorant text-gold text-xs tracking-widest2 uppercase text-center mb-8">
          Barbería Nueve Ocho — Admin
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full bg-transparent border border-dark-border text-cream font-cormorant px-4 py-3 focus:border-gold outline-none placeholder:text-dark-muted"
          />

          {error && <p className="font-cormorant text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-dark font-cormorant tracking-widest2 uppercase text-sm py-3 hover:bg-gold/80 transition-colors disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify login flow**

1. Go to `http://localhost:3000/admin` — should redirect to `/admin/login`
2. Enter wrong password — should show error
3. Enter correct password (`nueve98ocho` from `.env.local`) — should redirect to `/admin`

- [ ] **Step 3: Commit**

```bash
git add app/admin/login/
git commit -m "feat: admin login page"
```

---

## Task 16: Admin Panel — Turnos Table

**Files:**
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Create admin panel page**

Create `app/admin/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'

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

  async function loadTurnos() {
    setLoading(true)
    const res = await fetch(`/api/admin/turnos?fecha=${fecha}`)
    const data = await res.json()
    setTurnos(data)
    setLoading(false)
  }

  async function updateEstado(id: number, estado: string) {
    await fetch(`/api/admin/turnos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    })
    loadTurnos()
  }

  useEffect(() => { loadTurnos() }, [fecha])

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
          <label className="font-cormorant text-gold text-xs tracking-widest2 uppercase">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="bg-transparent border border-dark-border text-cream font-cormorant px-4 py-2 focus:border-gold outline-none"
          />
        </div>

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
```

- [ ] **Step 2: Verify admin panel**

1. Login at `http://localhost:3000/admin/login`
2. Make a test booking from the landing page
3. Go to `http://localhost:3000/admin` — turno should appear
4. Change estado via dropdown — verify it updates

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: admin panel — turnos table with date filter and estado actions"
```

---

## Task 17: Deploy to Vercel

**Files:**
- No code changes needed — follow steps

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/TU_USUARIO/barberia-nueve-ocho.git
git push -u origin main
```

- [ ] **Step 2: Create project on Vercel**

1. Go to `https://vercel.com` → New Project → Import from GitHub
2. Select `barberia-nueve-ocho`
3. Framework: Next.js (auto-detected)

- [ ] **Step 3: Add Vercel Postgres**

In Vercel dashboard → Storage → Create Database → Postgres → Connect to project.

Vercel auto-sets `DATABASE_URL` and `POSTGRES_*` env vars.

- [ ] **Step 4: Update schema for PostgreSQL**

Before final deploy, update `prisma/schema.prisma` datasource:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Push migration to prod:

```bash
npx prisma migrate deploy
```

- [ ] **Step 5: Set environment variables in Vercel**

In Vercel dashboard → Settings → Environment Variables, add:

```
ADMIN_PASSWORD=<elegí uno seguro>
ADMIN_SESSION_TOKEN=<string largo aleatorio>
```

- [ ] **Step 6: Seed production database**

```bash
DATABASE_URL="<url de vercel postgres>" npx prisma db seed
```

- [ ] **Step 7: Deploy**

```bash
git push origin main
```

Vercel auto-deploys. Verify the live URL works end to end.

- [ ] **Step 8: Replace placeholder content**

- Upload real logo: replace `public/logo.png` with the real logo PNG
- Update `FOTOS` array in `components/sections/Galeria.tsx` with real photo URLs
- Update address/phone/Instagram in `components/sections/Contacto.tsx`
- Update barbero names/photos/specialties via Prisma Studio or seed script
- Update servicios and prices via Prisma Studio

```bash
git add -A
git commit -m "feat: replace placeholder content with real data"
git push
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Hero con logo, tagline, CTA → Task 8
- ✅ Servicios con precios → Task 9
- ✅ Galería con lightbox → Task 10
- ✅ Equipo con fotos → Task 11
- ✅ Reserva 3 pasos → Task 12
- ✅ Sistema propio de turnos en DB → Tasks 2, 4, 12
- ✅ Disponibilidad dinámica → Tasks 3, 4
- ✅ Race condition guard → Task 4 (POST /api/turnos con $transaction)
- ✅ Contacto + mapa + footer → Task 13
- ✅ Panel admin con filtros y acciones → Tasks 6, 15, 16
- ✅ Auth admin con cookie → Tasks 5, 15
- ✅ Estética Cine Noir Premium → Tasks 7, 8–13
- ✅ Deploy Vercel → Task 17

**Type consistency:**
- `Barbero` interface matches Prisma model throughout
- `Servicio` interface matches Prisma model throughout
- `getAvailableSlots` signature consistent between `lib/slots.ts` and `app/api/disponibilidad/route.ts`
- `COOKIE_NAME` and `isValidSession` imported from `lib/auth.ts` in both middleware and login route
