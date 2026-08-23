import type { Metadata } from 'next'
import { Space_Grotesk, Inter, Space_Mono } from 'next/font/google'
import '../globals.css'
import NextAuthProvider from '@/components/providers/NextAuthProvider'

// We use Space Grotesk as it closely resembles the blocky, geometric nature of Twitch's Roobert font
const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'TwitchTag - Générateur de Pseudo Gaming & Twitch #1',
    template: '%s | TwitchTag'
  },
  description: 'Le meilleur générateur de pseudo gaming et Twitch. Trouvez des idées de pseudos originaux, stylés et vérifiez leur disponibilité en direct. Gaming pseudo generator.',
  keywords: [
    'générateur de pseudo', 
    'twitch pseudo', 
    'idée pseudo twitch', 
    'generate pseudo gaming', 
    'gaming pseudo generator', 
    'pseudo gamer',
    'twitch name generator',
    'vérificateur pseudo twitch',
    'pseudo disponible',
    'pseudo original'
  ],
  authors: [{ name: 'TwitchTag' }],
  creator: 'TwitchTag',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://twitch-tag-com.vercel.app/',
    title: 'TwitchTag - Générateur de Pseudo Gaming & Twitch #1',
    description: 'Le meilleur générateur de pseudo gaming et Twitch. Trouvez des idées de pseudos originaux et vérifiez leur disponibilité en temps réel.',
    siteName: 'TwitchTag',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TwitchTag - Le Générateur de Pseudo Gaming Référence',
    description: 'Générez et vérifiez la disponibilité de votre futur pseudo Twitch en un clic.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';

export default async function RootLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${spaceGrotesk.variable} ${inter.variable} ${spaceMono.variable}`}>
      <body className="min-h-screen bg-bg-primary font-sans antialiased selection:bg-twitch-yellow selection:text-black">
        <NextIntlClientProvider messages={messages}>
          <NextAuthProvider>
            {children}
          </NextAuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
