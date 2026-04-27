import Image from 'next/image'
import SectionLabel from '@/components/ui/SectionLabel'
import type { Barbero } from '@/lib/types'

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
                  className="object-cover"
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
