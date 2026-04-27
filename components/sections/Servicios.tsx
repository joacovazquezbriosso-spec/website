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
