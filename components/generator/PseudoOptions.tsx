'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sliders, Sparkles, Hash, AtSign, Brain, Plus, X, RefreshCw } from 'lucide-react'

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
    <div className="brutal-card bg-bg-primary overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b-4 border-[#303032] bg-twitch-purple">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center shadow-brutal-sm">
            <Sliders className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-wider">Options</h2>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Keywords */}
        <div>
          <label className="block text-sm font-bold text-white uppercase tracking-wider mb-3">
            Mots-clés
          </label>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: pro, gamer..."
              className="brutal-input flex-1"
            />
            <button
              onClick={addKeyword}
              disabled={!keywordInput.trim()}
              className="w-12 h-12 flex items-center justify-center bg-twitch-yellow text-black border-2 border-black shadow-brutal-sm hover:-translate-y-1 hover:shadow-brutal active:translate-y-0 active:shadow-none disabled:opacity-50 transition-all"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {options.keywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-bold border-2 border-black shadow-brutal-sm text-sm uppercase"
              >
                {keyword}
                <button
                  onClick={() => removeKeyword(keyword)}
                  className="hover:text-twitch-purple transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <label className={`flex items-center justify-between p-4 border-2 transition-all cursor-pointer ${
            options.includeNumbers ? 'bg-twitch-cyan border-black shadow-brutal text-black' : 'bg-bg-tertiary border-[#303032] text-white hover:border-white'
          }`}>
            <div className="flex items-center gap-3">
              <Hash className="w-6 h-6" />
              <span className="font-bold uppercase tracking-wider">Nombres</span>
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={options.includeNumbers}
              onChange={(e) => onChange({ ...options, includeNumbers: e.target.checked })}
            />
          </label>

          <label className={`flex items-center justify-between p-4 border-2 transition-all cursor-pointer ${
            options.includeSpecialChars ? 'bg-twitch-pink border-black shadow-brutal text-black' : 'bg-bg-tertiary border-[#303032] text-white hover:border-white'
          }`}>
            <div className="flex items-center gap-3">
              <AtSign className="w-6 h-6" />
              <span className="font-bold uppercase tracking-wider">Symboles</span>
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={options.includeSpecialChars}
              onChange={(e) => onChange({ ...options, includeSpecialChars: e.target.checked })}
            />
          </label>

          <label className={`flex items-center justify-between p-4 border-2 transition-all cursor-pointer ${
            options.easyToRemember ? 'bg-twitch-yellow border-black shadow-brutal text-black' : 'bg-bg-tertiary border-[#303032] text-white hover:border-white'
          }`}>
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6" />
              <span className="font-bold uppercase tracking-wider">Mémorable</span>
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={options.easyToRemember}
              onChange={(e) => onChange({ ...options, easyToRemember: e.target.checked })}
            />
          </label>
        </div>

        {/* Sliders */}
        <div className="space-y-6 pt-6 border-t-4 border-[#303032]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold text-white uppercase tracking-wider">
                Longueur max
              </label>
              <span className="px-3 py-1 bg-white text-black font-bold border-2 border-black shadow-brutal-sm">
                {options.length}
              </span>
            </div>
            <input
              type="range"
              min="6"
              max="25"
              value={options.length}
              onChange={(e) => onChange({ ...options, length: parseInt(e.target.value) })}
              className="w-full h-4 bg-bg-tertiary border-2 border-black rounded-none appearance-none cursor-pointer accent-twitch-purple"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold text-white uppercase tracking-wider">
                Résultats
              </label>
              <span className="px-3 py-1 bg-white text-black font-bold border-2 border-black shadow-brutal-sm">
                {options.count}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              value={options.count}
              onChange={(e) => onChange({ ...options, count: parseInt(e.target.value) })}
              className="w-full h-4 bg-bg-tertiary border-2 border-black rounded-none appearance-none cursor-pointer accent-twitch-yellow"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full brutal-btn text-xl py-6"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-6 h-6 animate-spin" />
              Génération...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              Générer Pseudos
            </>
          )}
        </button>
      </div>
    </div>
  )
}
