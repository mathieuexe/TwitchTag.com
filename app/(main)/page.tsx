import Header from '@/components/layout/Header'
import LiveCounters from '@/components/stats/LiveCounters'
import PseudoGenerator from '@/components/generator/PseudoGenerator'

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pt-8 sm:pt-16 pb-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <PseudoGenerator />

        </div>
      </main>

      {/* Live Counters Footer / Fixed Bottom or just above footer */}
      <div className="bg-bg-secondary border-t border-white/5 py-4 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LiveCounters />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-bg-primary py-8 text-center text-sm font-semibold text-text-muted">
        <div className="flex items-center justify-center gap-6 mb-4 uppercase">
          <a href="/" className="hover:text-twitch-purple transition-colors">Accueil</a>
          <a href="/verifier" className="hover:text-twitch-purple transition-colors">Vérifier</a>
          <a href="/donation" className="hover:text-twitch-purple transition-colors">Soutenir</a>
        </div>
        <p>© {new Date().getFullYear()} Pseudo Gen - Inspiré par la communauté gaming</p>
      </footer>
    </div>
  )
}
