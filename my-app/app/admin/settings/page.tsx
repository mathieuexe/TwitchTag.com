'use client'

import { Settings, Save, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => setSaving(false), 1000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
          <Settings className="w-8 h-8 text-twitch-yellow" />
          Paramètres
        </h1>
        <p className="text-text-secondary font-medium mt-2">
          Configuration globale du site
        </p>
      </div>

      <div className="brutal-card p-6 bg-bg-secondary">
        <h3 className="text-2xl font-black text-white uppercase mb-6 border-b-4 border-[#303032] pb-4">
          Général
        </h3>
        
        <div className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-bold text-white uppercase tracking-wider mb-2">
              Nom du site
            </label>
            <input type="text" defaultValue="TwitchTag" className="brutal-input" />
          </div>

          <div>
            <label className="block text-sm font-bold text-white uppercase tracking-wider mb-2">
              Mode maintenance
            </label>
            <div className="flex items-center gap-3 p-4 bg-twitch-pink/10 border-2 border-twitch-pink text-twitch-pink">
              <AlertCircle className="w-6 h-6" />
              <div className="flex-1">
                <p className="font-bold uppercase">Activer la maintenance</p>
                <p className="text-sm opacity-80">Seuls les admins pourront accéder au site.</p>
              </div>
              <input type="checkbox" className="w-6 h-6 border-2 border-twitch-pink bg-transparent" />
            </div>
          </div>
        </div>
      </div>

      <div className="brutal-card p-6 bg-bg-secondary">
        <h3 className="text-2xl font-black text-white uppercase mb-6 border-b-4 border-[#303032] pb-4">
          Générateur
        </h3>
        
        <div className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-bold text-white uppercase tracking-wider mb-2">
              Limite de génération par IP (par heure)
            </label>
            <input type="number" defaultValue="50" className="brutal-input" />
          </div>
        </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={saving}
        className="brutal-btn py-4 text-xl"
      >
        <Save className="w-6 h-6" />
        {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
      </button>
    </div>
  )
}
