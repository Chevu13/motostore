import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: {
    default: 'MotoStore.rs - Premium Moto Oprema za Srbiju',
    template: '%s | MotoStore.rs',
  },
  description:
    'Vrhunska motociklistička oprema sa dostavom na kućnu adresu. Kacige, jakne, rukavice, čizme i sve za vašeg motocikla. Plaćanje pouzećem.',
  keywords: ['moto oprema', 'kacige', 'moto jakne', 'motociklistička oprema', 'Srbija', 'MotoStore'],
  openGraph: {
    type: 'website',
    locale: 'sr_RS',
    url: 'https://motostore.rs',
    siteName: 'MotoStore.rs',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          /* Instant fallback so buttons/text are visible before fonts load */
          .btn-moto { background: #FF4500 !important; color: #fff !important; }
          .btn-outline-moto { color: #FF4500 !important; border-color: rgba(255,69,0,0.6) !important; }
          .gradient-text { color: #FF4500; }
        `}} />
      </head>
      <body>
        <div className="noise-overlay" />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
