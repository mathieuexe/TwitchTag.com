'use client'

import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { GeneratedPseudo } from '@/types'
import { Users, Search, Trash2, Loader2, Filter } from 'lucide-react'

export default function AdminPseudosPage() {
  const [pseudos, setPseudos] = useState<GeneratedPseudo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPseudos()
  }, [])

  const fetchPseudos = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('generated_pseudos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setPseudos(data || [])
    } catch (error) {
      console.error('Error fetching pseudos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pseudo ?')) return

    try {
      const { error } = await supabaseClient
        .from('generated_pseudos')
        .delete()
        .eq('id', id)

      if (error) throw error
      setPseudos(pseudos.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting pseudo:', error)
    }
  }

  const filteredPseudos = pseudos.filter(p => 
    p.pseudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Users className="w-8 h-8 text-twitch-purple" />
            Pseudos Générés
          </h1>
          <p className="text-text-secondary font-medium mt-2">
            Historique des 100 derniers pseudos générés
          </p>
        </div>
      </div>

      <div className="brutal-card p-6 bg-bg-secondary">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Rechercher un pseudo ou un mot-clé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="brutal-input pl-12"
            />
          </div>
          <button className="brutal-btn-secondary px-4">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-4 border-[#303032]">
                <th className="p-4 font-black uppercase text-sm tracking-wider text-text-secondary">Pseudo</th>
                <th className="p-4 font-black uppercase text-sm tracking-wider text-text-secondary">Mots-clés</th>
                <th className="p-4 font-black uppercase text-sm tracking-wider text-text-secondary">Options</th>
                <th className="p-4 font-black uppercase text-sm tracking-wider text-text-secondary">Date</th>
                <th className="p-4 font-black uppercase text-sm tracking-wider text-text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#303032]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-twitch-purple" />
                  </td>
                </tr>
              ) : filteredPseudos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted font-bold uppercase">
                    Aucun résultat trouvé
                  </td>
                </tr>
              ) : (
                filteredPseudos.map((pseudo) => (
                  <tr key={pseudo.id} className="hover:bg-bg-tertiary transition-colors group">
                    <td className="p-4 font-mono font-bold text-lg text-white">
                      {pseudo.pseudo}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {pseudo.keywords?.map((kw, i) => (
                          <span key={i} className="px-2 py-1 bg-twitch-purple/20 text-twitch-purple text-xs font-bold uppercase border border-twitch-purple/30">
                            {kw}
                          </span>
                        )) || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {pseudo.hasNumbers && <span className="w-6 h-6 bg-twitch-cyan/20 text-twitch-cyan flex items-center justify-center font-bold text-xs border border-twitch-cyan/30" title="Nombres">#</span>}
                        {pseudo.hasSpecialChars && <span className="w-6 h-6 bg-twitch-pink/20 text-twitch-pink flex items-center justify-center font-bold text-xs border border-twitch-pink/30" title="Symboles">@</span>}
                        {pseudo.easyToRemember && <span className="w-6 h-6 bg-twitch-yellow/20 text-twitch-yellow flex items-center justify-center font-bold text-xs border border-twitch-yellow/30" title="Mémorable">🧠</span>}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-text-secondary">
                      {new Date(pseudo.createdAt || '').toLocaleDateString('fr-FR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(pseudo.id!)}
                        className="p-2 text-text-muted hover:text-twitch-pink transition-colors opacity-0 group-hover:opacity-100"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
