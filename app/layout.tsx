import type { Metadata } from 'next'
import { Space_Grotesk, Inter, Space_Mono } from 'next/font/google'
import './globals.css'

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
  title: 'TwitchTag - Générateur de Pseudo Twitch',
  description: 'Générez et vérifiez des pseudos Twitch disponibles. Trouvez le pseudo parfait pour votre chaîne Twitch.',
  keywords: ['twitch', 'pseudo', 'générateur', 'username', 'streamer', 'gaming'],
  authors: [{ name: 'TwitchTag' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${spaceGrotesk.variable} ${inter.variable} ${spaceMono.variable}`}>
      <body className="min-h-screen bg-bg-primary font-sans antialiased selection:bg-twitch-yellow selection:text-black">
        {children}
      </body>
    </html>
  )
}
