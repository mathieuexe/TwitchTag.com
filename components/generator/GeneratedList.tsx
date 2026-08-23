'use client'

import { motion } from 'framer-motion'
import { Copy, Check, ExternalLink, Loader2, Twitch, Flame, Zap, Shield } from 'lucide-react'
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
  const [copiedPseudo, setCopiedPseudo] = useState<string | null>(null)

  const handleCopy = async (pseudo: string) => {
    await onCopy(pseudo)
    setCopiedPseudo(pseudo)
    setTimeout(() => setCopiedPseudo(null), 2000)
  }

  const getRandomIcon = (pseudo: string) => {
    const icons = [Flame, Zap, Shield]
    // Use pseudo string length to pseudo-randomize icon consistently
    const index = pseudo.length
    const Icon = icons[index % icons.length]
    const colors = ['text-[#ff8200]', 'text-[#facc15]', 'text-[#3b82f6]']
    return <Icon className={`w-5 h-5 ${colors[index % colors.length]}`} fill="currentColor" />
  }

  // Sort: Available first, then checking (null), then taken (false)
  const sortedPseudos = [...pseudos].sort((a, b) => {
    const getScore = (available: boolean | null) => {
      if (available === true) return 0
      if (available === null) return 1
      return 2
    }
    return getScore(a.available) - getScore(b.available)
  })

  return (
    <div className="twitch-card overflow-hidden">
      {/* List */}
      <div className="divide-y divide-white/5">
        {sortedPseudos.map((item, index) => {
          const isAvailable = item.available === true
          const isTaken = item.available === false

          return (
            <motion.div
              layout
              key={item.pseudo}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <Twitch className="w-5 h-5 text-twitch-purple" />
                {getRandomIcon(item.pseudo)}

                {/* Pseudo */}
                <span className={`text-lg font-semibold tracking-wide ${isTaken ? 'text-text-muted line-through' : 'text-white'}`}>
                  {item.pseudo}
                </span>

                {/* Status Dot for checking/taken */}
                {item.checking && (
                  <Loader2 className="w-4 h-4 text-text-muted animate-spin ml-2" />
                )}
                {isTaken && (
                  <span className="text-xs text-twitch-red font-semibold ml-2">[RÉSERVÉ]</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                {/* Reserve/Twitch Link */}
                {isAvailable && (
                  <a
                    href={`https://twitch.tv/${item.pseudo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-muted hover:text-twitch-purple text-sm font-semibold transition-colors"
                  >
                    [RÉSERVER]
                  </a>
                )}

                {/* Copy Button */}
                {isAvailable && (
                  <button
                    onClick={() => handleCopy(item.pseudo)}
                    className={`text-sm font-semibold transition-colors flex items-center gap-1 ${
                      copiedPseudo === item.pseudo
                        ? 'text-twitch-green'
                        : 'text-text-muted hover:text-white'
                    }`}
                  >
                    {copiedPseudo === item.pseudo ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    [COPIER]
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
