import type { Metadata } from 'next'
import { Montserrat, Inter } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-montserrat'
})

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Prismas 33 - Tecnologia que Refrata Soluções',
  description: 'Ferramentas inteligentes para desenvolvedores, empresas e mentes criativas',
  icons: {
    icon: '/assets/logos/logo.png',
    apple: '/assets/logos/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${montserrat.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  )
}
