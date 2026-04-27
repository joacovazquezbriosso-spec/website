import GoldDivider from '@/components/ui/GoldDivider'

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-dark px-8 text-center">
      <div className="flex flex-col items-center gap-6 max-w-3xl">
        <p className="font-cormorant italic text-cream/80 text-2xl tracking-widest">
          Barbería
        </p>
        <h1 className="font-gothic text-cream leading-none" style={{ fontSize: 'clamp(3.5rem, 12vw, 8rem)' }}>
          Nueve Ocho
        </h1>

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
