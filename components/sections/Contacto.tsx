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
              <a
                href="https://www.google.com/maps/place/Barberia+Nueve+Ocho+%2298%22/@-34.8043529,-55.9011786,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream hover:text-gold transition-colors"
              >
                Barbería Nueve Ocho
              </a>
            </div>
            <div>
              <p className="text-gold text-xs tracking-widest2 uppercase mb-2">Horarios</p>
              <p className="text-cream text-lg">Martes a Sábado</p>
              <p className="text-dark-muted">10:00 — 20:00 hs</p>
            </div>
            <div>
              <p className="text-gold text-xs tracking-widest2 uppercase mb-2">Contacto</p>
              <a
                href="https://wa.me/598095006417"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream hover:text-gold transition-colors block"
              >
                095 006 417
              </a>
              <a
                href="https://www.instagram.com/nueveocho.barberia/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream hover:text-gold transition-colors block mt-1"
              >
                @nueveocho.barberia
              </a>
            </div>
          </div>

          {/* Google Maps embed */}
          <div className="min-h-[200px]">
            <iframe
              src="https://maps.google.com/maps?q=-34.8043529,-55.9011786&z=17&output=embed"
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
