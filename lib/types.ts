export interface Barbero {
  id: number
  nombre: string
  especialidad: string
  foto: string
  activo: boolean
}

export interface Servicio {
  id: number
  nombre: string
  precio: number
  duracion: number
  activo: boolean
}

export interface Turno {
  id: number
  barberoId: number
  servicioId: number
  clienteNombre: string
  clienteTel: string
  fecha: string
  hora: string
  estado: string
  creadoEn: string
}
