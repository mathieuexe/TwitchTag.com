'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Check, X, Loader2, Shield, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react'
import Header from '@/components/layout/Header'

interface CheckResult {
  username: string
  available: boolean
  error?: string
}

export default function VerifierPage() {
  const [username, setUsername] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [recentChecks, setRecentChecks] = useState<CheckResult[]>([])

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || isChecking) return

    setIsChecking(true)
    setResult(null)

    try {
      const response = await fetch(
        `/api/check-username?username=${encodeURIComponent(username.trim())}`
      )

      if (!response.ok) {
        throw new Error('Failed to check username')
      }

      const data: CheckResult = await response.json()
      setResult(data)
      
      setRecentChecks((prev) => {
        const filtered = prev.filter((r) => r.username.toLowerCase() !== data.username.toLowerCase())
        return [data, ...filtered].slice(0, 5)
      })
    } catch (err) {
      console.error('Error checking username:', err)
      setResult({
        username: username.trim(),
        available: false,
        error: 'Une erreur est survenue. Veuillez réessayer.',
      })
    } finally {
      setIsChecking(false)
    }
  }

  const handleCheckAgain = (username: string) => {
    setUsername(username)
    setResult(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-twitch-cyan border-4 border-black mb-8 shadow-brutal transform -rotate-3">
              <Shield className="w-12 h-12 text-black" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white uppercase tracking-tighter mb-6">
              Vérificateur <span className="text-twitch-cyan">Twitch</span>
            </h1>
            <p className="text-text-secondary text-xl font-medium max-w-2xl mx-auto">
              Vérifie instantanément si un pseudo Twitch est disponible. Pas de bullshit, données en direct de l'API officielle.
            </p>
          </div>

          {/* Search Form */}
          <div className="brutal-card p-8 bg-twitch-purple mb-12">
            <form onSubmit={handleCheck} className="relative flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-text-muted" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tape un pseudo ici..."
                  className="w-full pl-14 pr-4 py-4 bg-white border-4 border-black text-black font-bold text-xl uppercase placeholder:text-black/40 focus:outline-none focus:shadow-brutal-sm transition-all"
                  disabled={isChecking}
                />
              </div>
              <button
                type="submit"
                disabled={!username.trim() || isChecking}
                className="brutal-btn bg-twitch-yellow text-black border-4 py-4 px-8 text-xl shadow-brutal-white sm:w-auto w-full"
              >
                {isChecking ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  'Vérifier'
                )}
              </button>
            </form>
          </div>

          {/* Result */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className={`brutal-card p-8 mb-12 ${
                  result.error
                    ? 'bg-[#303032]'
                    : result.available
                    ? 'bg-twitch-green'
                    : 'bg-twitch-pink'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                  <div className="w-20 h-20 bg-white border-4 border-black flex items-center justify-center shadow-brutal-sm shrink-0">
                    {result.error ? (
                      <AlertCircle className="w-10 h-10 text-black" />
                    ) : result.available ? (
                      <Check className="w-10 h-10 text-black" />
                    ) : (
                      <X className="w-10 h-10 text-black" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-3xl font-black text-black uppercase tracking-tight mb-2">
                      {result.error ? 'Erreur' : result.available ? 'C\'est dispo !' : 'Déjà pris'}
                    </h3>
                    <p className="text-black/80 font-bold text-lg">
                      <span className="bg-black text-white px-2 py-1 mr-2">{result.username}</span>
                      {result.error
                        ? result.error
                        : result.available
                        ? 'fonce le réserver avant qu\'il ne disparaisse.'
                        : 'il va falloir trouver autre chose.'}
                    </p>
                  </div>

                  {!result.error && (
                    <a
                      href={`https://twitch.tv/${result.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="brutal-btn-secondary bg-white text-black"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Voir
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Checks */}
          {recentChecks.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
                <RefreshCw className="w-6 h-6 text-twitch-yellow" />
                Historique récent
              </h3>
              <div className="grid gap-4">
                {recentChecks.map((check, index) => (
                  <div
                    key={`${check.username}-${index}`}
                    className="brutal-card p-4 bg-bg-secondary flex items-center justify-between hover:border-twitch-cyan"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 border-2 border-black ${
                        check.available ? 'bg-twitch-green shadow-brutal-sm' : 'bg-twitch-pink shadow-brutal-sm'
                      }`} />
                      <span className="font-bold text-xl text-white uppercase">{check.username}</span>
                    </div>
                    <button
                      onClick={() => handleCheckAgain(check.username)}
                      className="px-4 py-2 bg-white text-black font-bold uppercase text-sm border-2 border-black shadow-brutal-sm hover:-translate-y-1 hover:shadow-brutal transition-all"
                    >
                      Revérifier
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
