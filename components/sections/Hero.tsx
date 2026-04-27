import Image from 'next/image'
import GoldDivider from '@/components/ui/GoldDivider'

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-dark px-8 text-center">
      <div className="flex flex-col items-center gap-8 max-w-2xl">
        <Image
          src="/logo.png"
          alt="Barbería Nueve Ocho"
          width={480}
          height={240}
          priority
          className="w-full max-w-md"
        />

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
