# Barbería Nueve Ocho — Diseño del Sitio Web

**Fecha:** 2026-04-27  
**Stack:** Next.js 14 + Prisma + PostgreSQL + Tailwind CSS + Vercel

---

## 1. Resumen

Landing page premium de una sola página para Barbería Nueve Ocho (Buenos Aires), con sistema de reserva de turnos online integrado. El cliente puede elegir barbero, servicio, fecha y horario disponible, y el turno queda guardado en base de datos. Incluye panel de administración para gestionar turnos.

---

## 2. Estética

- **Estilo:** Cine Noir Premium — oscuro, espaciado máximo, detalles dorados sutiles
- **Paleta:**
  - Fondo: `#0d0d0d`
  - Dorado: `#c9a84c`
  - Crema: `#f5f0e8`
  - Gris oscuro bordes: `#222222`
  - Gris texto secundario: `#666666`
- **Tipografía:**
  - Títulos principales: UnifrakturMaguntia (Google Fonts) — gótica, igual al logo
  - Títulos secundarios y labels: Cormorant Garamond, mayúsculas, letter-spacing amplio
  - Cuerpo: Cormorant Garamond regular
- **Principios:** Sin gradientes llamativos, sin sombras pesadas, sin bordes redondeados. Líneas finas doradas como separadores. Todo en negro profundo.

---

## 3. Arquitectura

```
barberia-nueve-ocho/
├── app/
│   ├── page.tsx              ← landing page (una sola página)
│   ├── admin/
│   │   └── page.tsx          ← panel admin (protegido)
│   └── api/
│       ├── barberos/route.ts
│       ├── servicios/route.ts
│       ├── disponibilidad/route.ts
│       └── turnos/route.ts
├── components/
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── Servicios.tsx
│   │   ├── Galeria.tsx
│   │   ├── Equipo.tsx
│   │   ├── Reserva.tsx
│   │   └── Contacto.tsx
│   └── ui/
│       ├── GoldDivider.tsx   ← línea dorada separadora
│       └── SectionLabel.tsx  ← "01 — SECCIÓN" en dorado
├── prisma/
│   └── schema.prisma
└── lib/
    └── prisma.ts             ← cliente Prisma singleton
```

---

## 4. Base de Datos (Prisma)

```prisma
model Barbero {
  id          Int      @id @default(autoincrement())
  nombre      String
  especialidad String
  foto        String   // URL de la imagen
  activo      Boolean  @default(true)
  turnos      Turno[]
}

model Servicio {
  id        Int     @id @default(autoincrement())
  nombre    String
  precio    Int
  duracion  Int     // minutos
  activo    Boolean @default(true)
  turnos    Turno[]
}

model Turno {
  id            Int      @id @default(autoincrement())
  barberoId     Int
  servicioId    Int
  clienteNombre String
  clienteTel    String
  fecha         String   // "YYYY-MM-DD"
  hora          String   // "HH:MM"
  estado        String   @default("pendiente") // pendiente | confirmado | cancelado
  creadoEn      DateTime @default(now())
  barbero       Barbero  @relation(fields: [barberoId], references: [id])
  servicio      Servicio @relation(fields: [servicioId], references: [id])
}
```

---

## 5. API Routes

### `GET /api/barberos`
Devuelve lista de barberos activos.

### `GET /api/servicios`
Devuelve lista de servicios activos con nombre, precio y duración.

### `GET /api/disponibilidad?barberoId=X&fecha=YYYY-MM-DD`
- Horario de trabajo fijo: 09:00 a 20:00
- Intervalo de slots: según duración del servicio seleccionado (o 30 min por defecto)
- Consulta turnos existentes del barbero en esa fecha
- Devuelve array de horarios libres: `["09:00", "09:30", "10:00", ...]`

### `POST /api/turnos`
Body: `{ barberoId, servicioId, clienteNombre, clienteTel, fecha, hora }`
- Valida que el slot no esté ocupado (evita doble reserva por race condition con transacción)
- Crea el turno con estado `"pendiente"`
- Devuelve el turno creado

---

## 6. Secciones de la Landing Page

### 6.1 Hero
- Logo PNG de la barbería centrado (el logo existente)
- Frase debajo: tipografía Cormorant, italic, crema
- Línea dorada separadora
- Botón "RESERVAR TURNO" en dorado que hace scroll a la sección Reserva
- Fondo: `#0d0d0d` puro

### 6.2 Servicios
- Label: `02 — SERVICIOS`
- Grid 2 columnas en desktop, 1 en mobile
- Cada card: nombre en crema (uppercase, letra espaciada) + precio en dorado
- Borde `1px solid #222`

### 6.3 Galería
- Label: `03 — GALERÍA`
- Grid 3 columnas en desktop, 2 en mobile
- Fotos con aspect-ratio 1:1 (cuadradas)
- Click abre lightbox oscuro con la imagen ampliada
- Placeholders reemplazables con imágenes reales

### 6.4 Equipo
- Label: `04 — EL EQUIPO`
- Cards horizontales o grid: foto circular con borde dorado fino, nombre en crema, especialidad en dorado pequeño

### 6.5 Reserva
- Label: `05 — RESERVAR TURNO`
- Formulario de 3 pasos visuales (sin páginas separadas, todo inline):
  1. Elegir barbero (cards clickeables con foto)
  2. Elegir servicio → fecha → horario (se carga dinámicamente vía `/api/disponibilidad`)
  3. Ingresar nombre y teléfono → botón Confirmar
- Al confirmar: `POST /api/turnos` → mostrar mensaje de confirmación en la misma sección

### 6.6 Contacto
- Label: `06 — CONTACTO`
- Dirección (placeholder), horarios (Lun–Sáb), teléfono
- Links a Instagram y WhatsApp
- Mapa embebido de Google Maps (iframe)
- Footer: logo pequeño + `© 2026 Barbería Nueve Ocho`

---

## 7. Panel Admin (`/admin`)

- Protegido con variable de entorno `ADMIN_PASSWORD` — formulario de login simple con cookie de sesión
- Vista de turnos: tabla con fecha, hora, cliente, barbero, servicio, estado
- Filtros: por día y por barbero
- Acciones por turno: confirmar / cancelar (cambia el campo `estado`)
- Sin auth compleja — es una herramienta interna de uso diario

---

## 8. Deploy

- **Plataforma:** Vercel (plan gratuito)
- **Base de datos:** Vercel Postgres (incluido en Vercel)
- **Variables de entorno necesarias:**
  - `DATABASE_URL` — connection string de Vercel Postgres
  - `ADMIN_PASSWORD` — password del panel admin
- **Dominio:** configurar dominio propio desde Vercel dashboard

---

## 9. Contenido (placeholders a reemplazar)

| Elemento | Placeholder |
|----------|-------------|
| Fotos de galería | Imágenes oscuras de barbería de Unsplash |
| Fotos del equipo | Avatares placeholder |
| Servicios y precios | Corte Clásico, Afeitado Navaja, Corte + Barba, Tratamiento |
| Dirección | "Av. Corrientes 1234, CABA" |
| Teléfono | "+54 9 11 0000-0000" |
| Instagram | "@barberianueveocho" |
| Logo | PNG existente del usuario |

---

## 10. Fuera de alcance

- Sistema de pagos online
- Notificaciones por email/SMS
- App móvil
- Multi-sucursal
