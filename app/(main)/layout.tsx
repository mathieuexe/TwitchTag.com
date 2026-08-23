import Header from '@/components/layout/Header'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-bg-primary py-8 text-center text-sm font-semibold text-text-muted mt-auto">
        <div className="flex items-center justify-center gap-6 mb-4 uppercase">
          <a href="/" className="hover:text-twitch-purple transition-colors">Accueil</a>
          <a href="/verifier" className="hover:text-twitch-purple transition-colors">Vérifier</a>
          <a href="/chat" className="hover:text-twitch-purple transition-colors">Chat</a>
          <a href="/donation" className="hover:text-twitch-purple transition-colors">Soutenir</a>
        </div>
        <p>© {new Date().getFullYear()} TwitchTag.com - Inspiré par la communauté gaming</p>
      </footer>
    </div>
  )
}