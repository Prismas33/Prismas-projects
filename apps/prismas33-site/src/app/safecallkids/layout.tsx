import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SafeCallKids - Protegendo Crianças de Chamadas Indesejadas',
  description: 'SafeCallKids protege suas crianças bloqueando chamadas de números desconhecidos. Apenas contatos salvos podem ligar.',
  keywords: 'SafeCallKids, proteção infantil, bloqueio de chamadas, segurança criança, controle parental, app android',
  authors: [{ name: 'Prismas 33' }],
  creator: 'Prismas 33',
  publisher: 'Prismas e Quadriláteros Unip. Lda.',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    alternateLocale: 'en_US',
    title: 'SafeCallKids - Protegendo Crianças de Chamadas Indesejadas',
    description: 'SafeCallKids protege suas crianças bloqueando chamadas de números desconhecidos. Apenas contatos salvos podem ligar.',
    siteName: 'SafeCallKids',
    images: [
      {
        url: '/assets/logos/safecallkids.jpg',
        width: 1200,
        height: 630,
        alt: 'SafeCallKids - Proteção para crianças',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SafeCallKids - Protegendo Crianças de Chamadas Indesejadas',
    description: 'SafeCallKids protege suas crianças bloqueando chamadas de números desconhecidos.',
    images: ['/assets/logos/safecallkids.jpg'],
  },
  icons: {
    icon: '/assets/Safecallkids/safecallkids-favicon.png',
    apple: '/assets/Safecallkids/safecallkids-favicon.png',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#5DADE2',
};

export default function SafeCallKidsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
