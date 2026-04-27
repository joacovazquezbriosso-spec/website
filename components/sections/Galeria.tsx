'use client'

import { useState } from 'react'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import SectionLabel from '@/components/ui/SectionLabel'

const FOTOS = [
  { src: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80', alt: 'Corte 1' },
  { src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80', alt: 'Corte 2' },
  { src: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80', alt: 'Corte 3' },
  { src: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800&q=80', alt: 'Corte 4' },
  { src: 'https://images.unsplash.com/photo-1562004760-aceed7bb0fe3?w=800&q=80', alt: 'Corte 5' },
  { src: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&q=80', alt: 'Corte 6' },
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
