'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, AlertCircle } from 'lucide-react'
import PseudoOptions from './PseudoOptions'
import GeneratedList from './GeneratedList'

interface GenerateOptions {
  keywords: string[]
  includeNumbers: boolean
  includeSpecialChars: boolean
  easyToRemember: boolean
  length: number
  count: number
}

interface GeneratedPseudo {
  pseudo: string
  available: boolean | null
  checking: boolean
}

const DEFAULT_OPTIONS: GenerateOptions = {
  keywords: [],
  includeNumbers: true,
  includeSpecialChars: false,
  easyToRemember: true,
  length: 12,
  count: 10,
}

export default function PseudoGenerator() {
  const [options, setOptions] = useState<GenerateOptions>(DEFAULT_OPTIONS)
  const [generatedPseudos, setGeneratedPseudos] = useState<GeneratedPseudo[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-pseudo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      })

      if (!response.ok) {
        throw new Error('Failed to generate pseudos')
      }

      const data = await response.json()
      
      setGeneratedPseudos(
        data.pseudos.map((pseudo: string) => ({
          pseudo,
          available: null,
          checking: false,
        }))
      )
    } catch (err) {
      setError('Une erreur est survenue lors de la génération. Veuillez réessayer.')
      console.error('Error generating pseudos:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [options])

  const handleCheckAvailability = useCallback(async (index: number) => {
    setGeneratedPseudos((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, checking: true } : p
      )
    )

    try {
      const pseudo = generatedPseudos[index].pseudo
      const response = await fetch(
        `/api/check-username?username=${encodeURIComponent(pseudo)}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to check availability')
      }

      const data = await response.json()

      setGeneratedPseudos((prev) =>
        prev.map((p, i) =>
          i === index
            ? { ...p, available: data.available, checking: false }
            : p
        )
      )
    } catch (err) {
      console.error('Error checking availability:', err)
      setGeneratedPseudos((prev) =>
        prev.map((p, i) =>
          i === index ? { ...p, checking: false } : p
        )
      )
    }
  }, [generatedPseudos])

  const handleCopy = useCallback(async (pseudo: string) => {
    try {
      await navigator.clipboard.writeText(pseudo)
      await fetch('/api/track-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudo }),
      })
    } catch (err) {
      console.error('Error copying pseudo:', err)
    }
  }, [])

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Options Panel */}
        <div className="lg:col-span-5">
          <PseudoOptions
            options={options}
            onChange={setOptions}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>

        {/* Generated Pseudos */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 p-6 brutal-card bg-twitch-pink text-black flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center shadow-brutal-sm flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-black" />
                </div>
                <p className="font-bold uppercase tracking-wider">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {generatedPseudos.length > 0 ? (
            <GeneratedList
              pseudos={generatedPseudos}
              onCheckAvailability={handleCheckAvailability}
              onCopy={handleCopy}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full min-h-[400px] brutal-card bg-bg-primary border-dashed"
            >
              <div className="w-24 h-24 bg-twitch-purple border-4 border-black flex items-center justify-center mb-8 shadow-brutal-yellow transform -rotate-6">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 text-center">
                Prêt à générer ?
              </h3>
              <p className="text-text-secondary text-center max-w-md px-4 font-medium text-lg">
                Configure tes options à gauche et clique sur "Générer" pour obtenir tes pseudos.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
