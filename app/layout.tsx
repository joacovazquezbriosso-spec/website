import type { Metadata } from 'next'
import { Cormorant_Garamond, UnifrakturMaguntia } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const gothic = UnifrakturMaguntia({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-gothic',
})

export const metadata: Metadata = {
  title: 'Barbería Nueve Ocho',
  description: 'Barbería premium en Buenos Aires. Reservá tu turno online.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${cormorant.variable} ${gothic.variable} bg-dark text-cream antialiased`}>
        {children}
      </body>
    </html>
  )
}
