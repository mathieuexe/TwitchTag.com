'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sliders, Sparkles, Hash, AtSign, Brain, Plus, X, RefreshCw, Search, Twitch } from 'lucide-react'

import { useTranslations } from 'next-intl'

interface GenerateOptions {
  keywords: string[]
  includeNumbers: boolean
  includeSpecialChars: boolean
  easyToRemember: boolean
  length: number
  count: number
}

interface PseudoOptionsProps {
  options: GenerateOptions
  onChange: (options: GenerateOptions) => void
  onGenerate: () => void
  isGenerating: boolean
}

export default function PseudoOptions({
  options,
  onChange,
  onGenerate,
  isGenerating,
}: PseudoOptionsProps) {
  const t = useTranslations('PseudoOptions')
  const [keywordInput, setKeywordInput] = useState('')

  const addKeyword = () => {
    const trimmed = keywordInput.trim().toLowerCase()
    if (trimmed && !options.keywords.includes(trimmed)) {
      onChange({
        ...options,
        keywords: [...options.keywords, trimmed],
      })
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    onChange({
      ...options,
      keywords: options.keywords.filter((k) => k !== keyword),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  return (
    <div className="twitch-card overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-6 text-center border-b border-white/5">
        <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
          Crée ton pseudo gaming unique
        </h2>
        <p className="text-text-secondary mt-2 text-sm">
          Générez un pseudonyme unique et stylé pour vos jeux, streams et communautés !
        </p>
      </div>

      <div className="p-6 space-y-8 flex-1">
        {/* Search Input (Keywords) */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-text-muted" />
          </div>
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('keywords_placeholder')}
            className="twitch-input pl-10 bg-[#1f1f23] hover:bg-white/5"
          />
        </div>

        {/* Display Keywords */}
        {options.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {options.keywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-1 px-2 py-1 bg-twitch-purple/20 text-twitch-purple text-sm rounded-md font-semibold"
              >
                {keyword}
                <button onClick={() => removeKeyword(keyword)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Options grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-text-muted font-bold uppercase tracking-wider text-sm min-w-[120px]">
              [OPTIONS]
            </span>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => onChange({ ...options, includeNumbers: !options.includeNumbers })}
                className={`text-sm font-semibold transition-colors ${options.includeNumbers ? 'text-white' : 'text-text-muted hover:text-white/80'}`}
              >
                {t('numbers')}
              </button>
              <button
                onClick={() => onChange({ ...options, includeSpecialChars: !options.includeSpecialChars })}
                className={`text-sm font-semibold transition-colors ${options.includeSpecialChars ? 'text-white' : 'text-text-muted hover:text-white/80'}`}
              >
                {t('special_chars')}
              </button>
              <button
                onClick={() => onChange({ ...options, easyToRemember: !options.easyToRemember })}
                className={`text-sm font-semibold transition-colors ${options.easyToRemember ? 'text-white' : 'text-text-muted hover:text-white/80'}`}
              >
                {t('easy_to_remember')}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-text-muted font-bold uppercase tracking-wider text-sm min-w-[120px]">
                [LONGUEUR]
              </span>
              <span className="text-twitch-purple font-bold">
                {options.length} caractères
              </span>
            </div>
            <div className="flex items-center gap-4 w-full">
              <span className="text-xs text-text-muted font-bold w-4 text-right">4</span>
              <input
                type="range"
                min="4"
                max="25"
                value={options.length}
                onChange={(e) => onChange({ ...options, length: parseInt(e.target.value) })}
                className="w-full h-2 bg-[#1f1f23] rounded-lg appearance-none cursor-pointer accent-twitch-purple"
                style={{ accentColor: '#9146FF' }}
              />
              <span className="text-xs text-text-muted font-bold w-4 text-left">25</span>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="p-6">
        <button
          onClick={() => {
            if (keywordInput.trim()) {
              addKeyword()
              setTimeout(onGenerate, 100)
            } else {
              onGenerate()
            }
          }}
          disabled={isGenerating}
          className="w-full twitch-btn text-base py-3"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              [GÉNÉRATION...]
            </>
          ) : (
            <>
              [GÉNÉRER MON PSEUDO]
              <Twitch className="w-5 h-5 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
