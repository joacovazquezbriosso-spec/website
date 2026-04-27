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
