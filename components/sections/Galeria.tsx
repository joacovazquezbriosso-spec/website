'use client'

import { useState } from 'react'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import SectionLabel from '@/components/ui/SectionLabel'

const FOTOS = [
  { src: '/corte1.jpg', alt: 'Corte 1' },
  { src: '/corte2.jpg', alt: 'Corte 2' },
  { src: '/corte3.jpg', alt: 'Corte 3' },
  { src: '/corte4.jpg', alt: 'Corte 4' },
  { src: '/corte5.jpg', alt: 'Corte 5' },
  { src: '/corte6.jpg', alt: 'Corte 6' },
]

export default function Galeria() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  return (
    <section className="bg-dark py-28 px-8 border-t border-dark-border">
      <div className="max-w-4xl mx-auto">
        <SectionLabel number="03" label="Galería" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
          {FOTOS.map((foto, i) => (
            <button
              key={i}
              onClick={() => { setIndex(i); setOpen(true) }}
              className="relative aspect-square overflow-hidden group"
            >
              <Image
                src={foto.src}
                alt={foto.alt}
                fill
                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-dark/20 group-hover:bg-transparent transition-colors" />
            </button>
          ))}
        </div>

        <Lightbox
          open={open}
          close={() => setOpen(false)}
          index={index}
          slides={FOTOS.map((f) => ({ src: f.src }))}
          styles={{ container: { backgroundColor: 'rgba(13,13,13,0.97)' } }}
        />
      </div>
    </section>
  )
}
