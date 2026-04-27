export interface TurnoSlot {
  hora: string
  duracion: number
}

export function getAvailableSlots(
  existingTurnos: TurnoSlot[],
  duracion: number
): string[] {
  if (duracion <= 0) throw new Error('duracion must be positive')

  const OPEN = 10 * 60
  const CLOSE = 20 * 60
  const STEP = 45
  const LUNCH_START = 14 * 60
  const LUNCH_END = 15 * 60

  const occupied = new Set<number>()

  for (let t = LUNCH_START; t < LUNCH_END; t++) occupied.add(t)

  for (const turno of existingTurnos) {
    const [h, m] = turno.hora.split(':').map(Number)
    if (isNaN(h) || isNaN(m)) continue
    const start = h * 60 + m
    for (let t = start; t < start + turno.duracion; t++) {
      occupied.add(t)
    }
  }

  const slots: string[] = []
  for (let t = OPEN; t + duracion <= CLOSE; t += STEP) {
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
