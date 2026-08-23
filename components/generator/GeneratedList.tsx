'use client'

import { motion } from 'framer-motion'
import { Copy, Check, ExternalLink, Loader2, Search } from 'lucide-react'
import { useState } from 'react'

interface GeneratedPseudo {
  pseudo: string
  available: boolean | null
  checking: boolean
}

interface GeneratedListProps {
  pseudos: GeneratedPseudo[]
  onCheckAvailability: (index: number) => void
  onCopy: (pseudo: string) => void
}

export default function GeneratedList({
  pseudos,
  onCheckAvailability,
  onCopy,
}: GeneratedListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = async (pseudo: string, index: number) => {
    await onCopy(pseudo)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="brutal-card bg-bg-primary overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b-4 border-[#303032] bg-white flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black text-black uppercase tracking-wider">Résultats</h3>
          <p className="text-black/60 font-bold uppercase text-sm mt-1">
            {pseudos.length} suggestion{pseudos.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-twitch-green border-2 border-black shadow-brutal-sm" />
            <span className="text-black font-bold uppercase text-xs">Libre</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-twitch-pink border-2 border-black shadow-brutal-sm" />
            <span className="text-black font-bold uppercase text-xs">Pris</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="divide-y-4 divide-[#303032]">
        {pseudos.map((item, index) => {
          let cardBg = 'hover:bg-bg-tertiary'
          let statusBox = 'bg-[#303032]'
          
          if (item.available === true) {
            cardBg = 'bg-twitch-green/10 hover:bg-twitch-green/20'
            statusBox = 'bg-twitch-green shadow-brutal-sm'
          } else if (item.available === false) {
            cardBg = 'bg-twitch-pink/10 hover:bg-twitch-pink/20'
            statusBox = 'bg-twitch-pink shadow-brutal-sm'
          }

          return (
            <motion.div
              key={`${item.pseudo}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors group ${cardBg}`}
            >
              <div className="flex items-center gap-4">
                {/* Availability Box */}
                <div
                  className={`w-8 h-8 border-2 border-black flex-shrink-0 flex items-center justify-center ${statusBox}`}
                >
                  {item.checking && <Loader2 className="w-4 h-4 text-black animate-spin" />}
                </div>

                {/* Pseudo */}
                <span className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${item.available === false ? 'text-text-muted line-through' : 'text-white'}`}>
                  {item.pseudo}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {/* Copy Button (only if available or checking) */}
                {item.available !== false && (
                  <button
                    onClick={() => handleCopy(item.pseudo, index)}
                    className={`w-12 h-12 flex items-center justify-center border-2 border-black shadow-brutal-sm hover:-translate-y-1 hover:shadow-brutal transition-all ${
                      copiedIndex === index
                        ? 'bg-twitch-green text-black'
                        : 'bg-twitch-yellow text-black'
                    }`}
                    title="Copier"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Copy className="w-6 h-6" />
                    )}
                  </button>
                )}

                {/* Twitch Link */}
                <a
                  href={`https://twitch.tv/${item.pseudo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center bg-twitch-purple text-white border-2 border-black shadow-brutal-sm hover:-translate-y-1 hover:shadow-brutal transition-all"
                  title="Voir sur Twitch"
                >
                  <ExternalLink className="w-6 h-6" />
                </a>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
