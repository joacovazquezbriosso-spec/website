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
        turnos.push({ hora: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, duracion: 30 })
      }
    }
    const slots = getAvailableSlots(turnos, 30)
    expect(slots).toHaveLength(0)
  })
})
