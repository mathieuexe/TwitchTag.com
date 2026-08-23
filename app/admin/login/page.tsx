'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Twitch, AlertCircle, Loader2, ShieldCheck } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSetup, setIsCheckingSetup] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await fetch('/api/admin/setup/check')
        const data = await res.json()
        if (data.needsSetup) {
          setNeedsSetup(true)
        }
      } catch (err) {
        console.error('Error checking setup', err)
      } finally {
        setIsCheckingSetup(false)
      }
    }
    checkSetup()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (needsSetup) {
      try {
        const res = await fetch('/api/admin/setup/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, password })
        })

        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Erreur lors de la création')
          setIsLoading(false)
          return
        }
      } catch (err) {
        setError('Erreur réseau lors de la création')
        setIsLoading(false)
        return
      }
    }

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError('Email ou mot de passe incorrect')
      } else if (res?.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setError('Erreur de configuration du serveur')
      }
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingSetup) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-twitch-purple" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md twitch-card p-8 bg-bg-secondary">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-twitch-purple rounded-xl flex items-center justify-center mb-4">
            {needsSetup ? <ShieldCheck className="w-10 h-10 text-white" /> : <Twitch className="w-10 h-10 text-white" />}
          </div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider text-center">
            {needsSetup ? 'Configuration Initiale' : 'Espace Admin'}
          </h1>
          <p className="text-text-muted mt-2 text-center">
            {needsSetup 
              ? "Aucun administrateur détecté. Créez le compte principal." 
              : "Connexion requise"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-twitch-red/10 border border-twitch-red/20 rounded-md flex items-center gap-3 text-twitch-red">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {needsSetup && (
            <div>
              <label className="block text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Pseudo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="twitch-input"
                placeholder="Votre pseudo Admin"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="twitch-input"
              placeholder="admin@twitchtag.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="twitch-input"
              placeholder="••••••••"
              required
              minLength={needsSetup ? 6 : undefined}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full twitch-btn py-3 text-lg"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              needsSetup ? 'Créer le compte et se connecter' : 'Se Connecter'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}