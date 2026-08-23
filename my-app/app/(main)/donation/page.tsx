'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Gift, Zap, Star, Coffee, Crown, ArrowRight, Loader2, Check } from 'lucide-react'
import Header from '@/components/layout/Header'

const DONATION_AMOUNTS = [
  { amount: 2, icon: Coffee, label: 'Un café', color: 'bg-twitch-cyan' },
  { amount: 5, icon: Gift, label: 'Un cadeau', color: 'bg-twitch-pink' },
  { amount: 10, icon: Star, label: 'Une étoile', color: 'bg-twitch-yellow' },
]

export default function DonationPage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDonate = async () => {
    const amount = selectedAmount || parseInt(customAmount)
    if (!amount || amount < 1) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      if (!response.ok) throw new Error('Failed to create session')

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      setIsLoading(false)
    }
  }

  const finalAmount = selectedAmount || parseInt(customAmount) || 0

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      <main className="pt-24 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-twitch-yellow border-4 border-black mb-8 shadow-brutal transform rotate-3">
              <Heart className="w-12 h-12 text-black fill-current" />
            </div>
            <h1 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tighter mb-6">
              Soutenez <span className="text-twitch-yellow">TwitchTag</span>
            </h1>
            <p className="text-text-secondary text-xl font-medium max-w-2xl mx-auto border-l-4 border-twitch-purple pl-6">
              100% gratuit, sans pub, fait avec amour. Votre soutien permet de payer les serveurs et de garder l'outil en ligne.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Col - Options */}
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-6">
                Choisis ton montant
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {DONATION_AMOUNTS.map((option) => (
                  <button
                    key={option.amount}
                    onClick={() => {
                      setSelectedAmount(option.amount)
                      setCustomAmount('')
                    }}
                    className={`brutal-card p-6 flex flex-col items-center justify-center relative transition-all ${
                      selectedAmount === option.amount
                        ? `${option.color} border-white shadow-brutal-lg -translate-y-2 text-black`
                        : 'bg-bg-secondary text-white hover:border-white/50'
                    }`}
                  >
                    {selectedAmount === option.amount && (
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-black border-2 border-white rounded-full flex items-center justify-center shadow-brutal-sm">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <option.icon className={`w-10 h-10 mb-4 ${selectedAmount === option.amount ? 'text-black' : option.color.replace('bg-', 'text-')}`} />
                    <span className="text-4xl font-black mb-2">{option.amount}€</span>
                    <span className="font-bold uppercase tracking-wider text-sm opacity-80">{option.label}</span>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="brutal-card p-6 bg-twitch-purple mt-8">
                <label className="block text-sm font-black text-white uppercase tracking-wider mb-4">
                  Ou un montant personnalisé
                </label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setSelectedAmount(null)
                    }}
                    placeholder="15"
                    className="flex-1 bg-white border-4 border-black px-6 py-4 text-2xl font-black text-black placeholder:text-black/30 focus:outline-none focus:shadow-brutal-sm transition-shadow"
                  />
                  <div className="w-16 flex items-center justify-center bg-black border-4 border-black text-white text-2xl font-black">
                    €
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col - Checkout */}
            <div className="brutal-card p-8 bg-bg-secondary border-4 border-[#303032] sticky top-32">
              <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-8">
                Récapitulatif
              </h3>
              
              <div className="flex justify-between items-center mb-8 pb-8 border-b-4 border-[#303032]">
                <span className="text-xl font-bold text-text-secondary uppercase">Donation</span>
                <span className="text-4xl font-black text-white">{finalAmount}€</span>
              </div>

              <button
                onClick={handleDonate}
                disabled={!finalAmount || finalAmount < 1 || isLoading}
                className="w-full brutal-btn bg-twitch-yellow text-black border-4 py-6 text-2xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <Heart className="w-8 h-8 fill-current" />
                    Valider le don
                  </>
                )}
              </button>

              <div className="mt-8 flex items-center justify-center gap-2 text-text-muted font-bold text-sm uppercase">
                <Shield className="w-4 h-4" />
                Paiement 100% sécurisé via Stripe
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
