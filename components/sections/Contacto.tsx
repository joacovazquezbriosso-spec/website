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
              <a
                href="https://wa.me/5491100000000"
                className="text-cream hover:text-gold transition-colors block"
              >
                +54 9 11 0000-0000
              </a>
              <a
                href="https://instagram.com/barberianueveocho"
                className="text-cream hover:text-gold transition-colors block mt-1"
              >
                @barberianueveocho
              </a>
            </div>
          </div>

          {/* Google Maps embed */}
          <div className="min-h-[200px]">
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
