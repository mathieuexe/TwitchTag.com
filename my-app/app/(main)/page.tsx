import Header from '@/components/layout/Header'
import LiveCounters from '@/components/stats/LiveCounters'
import PseudoGenerator from '@/components/generator/PseudoGenerator'
import { Sparkles, Shield, Zap, Heart, Star, Hash } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      
      {/* Neo-brutalist Marquee */}
      <div className="marquee-container overflow-hidden border-b-4 border-[#303032] bg-twitch-purple">
        <div className="marquee-content py-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 text-white font-bold uppercase tracking-widest text-sm">
              <span>Nouveau design by TwitchTag</span>
              <Star className="w-4 h-4 fill-current text-twitch-yellow" />
              <span>Générateur 100% Gratuit</span>
              <Star className="w-4 h-4 fill-current text-twitch-yellow" />
              <span>Vérification en temps réel</span>
              <Star className="w-4 h-4 fill-current text-twitch-yellow" />
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden bg-bg-primary">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-white bg-white text-black font-bold uppercase tracking-wider text-sm mb-8 shadow-brutal-sm transform -rotate-2">
                <Zap className="w-5 h-5 text-twitch-purple fill-current" />
                <span>L'outil ultime des streamers</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white uppercase leading-[0.9] tracking-tighter mb-8">
                Trouve ton <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-twitch-purple via-twitch-pink to-twitch-purple animate-pulse-fast">
                  Pseudo
                </span> <br />
                Parfait.
              </h1>

              <p className="text-xl sm:text-2xl text-text-secondary font-medium max-w-2xl mb-12 border-l-4 border-twitch-yellow pl-6">
                Génère des pseudos uniques et vérifie leur disponibilité sur Twitch en un clin d'œil. 
                Sors du lot avec un nom qui claque.
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <a
                  href="#generator"
                  className="brutal-btn text-lg"
                >
                  <Sparkles className="w-6 h-6" />
                  Générer maintenant
                </a>
                <Link
                  href="/verifier"
                  className="brutal-btn-secondary text-lg"
                >
                  <Shield className="w-6 h-6" />
                  Vérifier un pseudo
                </Link>
              </div>
            </div>

            {/* Right Content / Graphic */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="relative w-full aspect-square border-4 border-[#303032] bg-bg-secondary shadow-brutal-lg p-8 flex flex-col justify-between transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 bg-twitch-cyan border-2 border-black shadow-brutal-sm" />
                  <div className="w-12 h-12 rounded-full bg-twitch-pink border-2 border-black shadow-brutal-sm" />
                </div>
                <div className="text-center">
                  <span className="inline-block bg-twitch-purple text-white text-4xl font-black uppercase tracking-widest px-6 py-3 border-4 border-black shadow-brutal-yellow -rotate-6">
                    GLHF
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-white font-mono text-xl">&lt;///&gt;</div>
                  <Hash className="w-16 h-16 text-twitch-yellow" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Live Counters Section */}
      <div className="border-y-4 border-[#303032] bg-bg-secondary">
        <LiveCounters />
      </div>

      {/* Generator Section */}
      <section id="generator" className="py-24 bg-bg-primary relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#303032 2px, transparent 2px)', backgroundSize: '32px 32px' }} />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter mb-4 inline-block border-b-8 border-twitch-purple pb-2">
              Le Générateur
            </h2>
            <p className="text-text-secondary text-xl font-medium max-w-2xl mt-6">
              Ajuste les paramètres, clique, et laisse la magie opérer.
            </p>
          </div>

          <PseudoGenerator />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t-4 border-[#303032] bg-bg-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-16 text-center">
            Pourquoi TwitchTag ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="brutal-card p-8 bg-twitch-purple group">
              <div className="w-16 h-16 bg-white border-2 border-black flex items-center justify-center mb-8 shadow-brutal-sm group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-twitch-purple" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase mb-4">
                Vitesse Éclair
              </h3>
              <p className="text-white/90 font-medium">
                Notre algorithme pond des pseudos à la vitesse de la lumière. Pas le temps de niaiser.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="brutal-card p-8 bg-twitch-cyan group">
              <div className="w-16 h-16 bg-white border-2 border-black flex items-center justify-center mb-8 shadow-brutal-sm group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-black text-black uppercase mb-4">
                Vérif. Directe
              </h3>
              <p className="text-black/80 font-medium">
                Connecté directement à l'API Twitch. Si on te dit que c'est libre, c'est libre.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="brutal-card p-8 bg-twitch-pink group">
              <div className="w-16 h-16 bg-white border-2 border-black flex items-center justify-center mb-8 shadow-brutal-sm group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-black text-black uppercase mb-4">
                Sur Mesure
              </h3>
              <p className="text-black/80 font-medium">
                Nombres, symboles, longueur... C'est toi le boss, on s'adapte à tes envies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t-4 border-twitch-purple pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-twitch-purple text-white border-2 border-white/20 flex items-center justify-center shadow-brutal-sm">
                  <span className="font-black text-2xl">T</span>
                </div>
                <span className="text-3xl font-black text-white uppercase tracking-tighter">
                  Twitch<span className="text-twitch-purple">Tag</span>
                </span>
              </div>
              <p className="text-text-secondary font-medium text-lg max-w-md">
                L'outil ultime, brutal et efficace pour trouver ton identité de streamer.
              </p>
            </div>
            <div className="flex gap-16 md:justify-end">
              <div>
                <h4 className="text-white font-black uppercase tracking-wider mb-6 text-xl">Menu</h4>
                <ul className="space-y-4 font-medium">
                  <li><a href="/" className="text-text-secondary hover:text-twitch-cyan transition-colors">Générateur</a></li>
                  <li><a href="/verifier" className="text-text-secondary hover:text-twitch-cyan transition-colors">Vérificateur</a></li>
                  <li><a href="/donation" className="text-text-secondary hover:text-twitch-yellow transition-colors">Soutenir</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t-2 border-[#303032] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 font-medium text-sm text-text-muted">
            <p>© {new Date().getFullYear()} TwitchTag. Brutal Design.</p>
            <p>Non affilié à Twitch Interactive, Inc.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
