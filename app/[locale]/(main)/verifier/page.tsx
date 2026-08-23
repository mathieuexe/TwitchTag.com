'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Check, X, Loader2, Shield, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react'

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
    <div className="flex-1 flex flex-col pt-8 sm:pt-16 pb-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
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
          <div className="twitch-card p-8 bg-bg-secondary mb-12">
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
                  className="twitch-input pl-12"
                  disabled={isChecking}
                />
              </div>
              <button
                type="submit"
                disabled={!username.trim() || isChecking}
                className="twitch-btn py-3 px-8 sm:w-auto w-full"
              >
                {isChecking ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
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
                className={`twitch-card p-8 mb-12 border ${
                  result.error
                    ? 'border-white/10'
                    : result.available
                    ? 'border-twitch-green bg-twitch-green/5'
                    : 'border-twitch-red bg-twitch-red/5'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 ${
                     result.error ? 'bg-white/10 text-white' : result.available ? 'bg-twitch-green/20 text-twitch-green' : 'bg-twitch-red/20 text-twitch-red'
                  }`}>
                    {result.error ? (
                      <AlertCircle className="w-8 h-8" />
                    ) : result.available ? (
                      <Check className="w-8 h-8" />
                    ) : (
                      <X className="w-8 h-8" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight mb-1">
                      {result.error ? 'Erreur' : result.available ? 'C\'est dispo !' : 'Déjà pris'}
                    </h3>
                    <p className="text-text-secondary font-medium">
                      <span className="text-white font-bold mr-2">[{result.username}]</span>
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
                      className="twitch-btn-secondary"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
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
              <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-twitch-purple" />
                Historique récent
              </h3>
              <div className="grid gap-3">
                {recentChecks.map((check, index) => (
                  <div
                    key={`${check.username}-${index}`}
                    className="twitch-card p-4 bg-bg-secondary flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        check.available ? 'bg-twitch-green' : 'bg-twitch-red'
                      }`} />
                      <span className="font-semibold text-lg text-white">{check.username}</span>
                    </div>
                    <button
                      onClick={() => handleCheckAgain(check.username)}
                      className="text-sm font-semibold text-text-muted hover:text-white transition-colors"
                    >
                      [REVÉRIFIER]
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
