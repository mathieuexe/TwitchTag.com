'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Gift, Zap, Star, Coffee, Crown, ArrowRight, Loader2, Check, Shield } from 'lucide-react'
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
    <div className="flex-1 flex flex-col pt-8 sm:pt-16 pb-24">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-twitch-purple rounded-xl mb-8">
            <Heart className="w-10 h-10 text-white fill-current" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter mb-4 inline-block border-b-8 border-twitch-purple pb-2">
            Soutenez <span className="text-twitch-purple">TwitchTag</span>
          </h1>
          <p className="text-text-secondary text-xl font-medium max-w-2xl mx-auto mt-6">
            100% gratuit, sans pub, fait avec amour. Votre soutien permet de payer les serveurs et de garder l'outil en ligne.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Col - Options */}
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-6">
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
                  className={`twitch-card p-6 flex flex-col items-center justify-center relative transition-all ${
                    selectedAmount === option.amount
                      ? `border-twitch-purple bg-twitch-purple/10 text-white`
                      : 'bg-bg-secondary text-text-primary hover:bg-white/5'
                  }`}
                >
                  {selectedAmount === option.amount && (
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-twitch-purple rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <option.icon className={`w-8 h-8 mb-4 ${selectedAmount === option.amount ? 'text-twitch-purple' : 'text-text-muted'}`} />
                  <span className="text-3xl font-bold mb-2">{option.amount}€</span>
                  <span className="font-semibold uppercase tracking-wider text-xs opacity-80">{option.label}</span>
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="twitch-card p-6 bg-bg-secondary mt-8">
              <label className="block text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
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
                  className="flex-1 twitch-input text-2xl font-bold"
                />
                <div className="w-16 flex items-center justify-center bg-bg-input border border-white/10 rounded-lg text-white text-xl font-bold">
                  €
                </div>
              </div>
            </div>
          </div>

          {/* Right Col - Checkout */}
          <div className="twitch-card p-8 bg-bg-secondary sticky top-32">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-8">
              Récapitulatif
            </h3>
            
            <div className="flex justify-between items-center mb-8 pb-8 border-b border-white/10">
              <span className="text-lg font-semibold text-text-secondary uppercase">Donation</span>
              <span className="text-3xl font-bold text-white">{finalAmount}€</span>
            </div>

            <button
              onClick={handleDonate}
              disabled={!finalAmount || finalAmount < 1 || isLoading}
              className="w-full twitch-btn py-4 text-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <Heart className="w-6 h-6 fill-current" />
                  Valider le don
                </>
              )}
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-text-muted font-semibold text-sm uppercase">
              <Shield className="w-4 h-4" />
              Paiement 100% sécurisé via Stripe
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
