'use client'

import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { Copy, Search, Loader2 } from 'lucide-react'

interface CopiedRecord {
  id: string
  pseudo: string
  created_at: string
  generated_pseudo_id?: string
}

export default function AdminCopiedPage() {
  const [copiedPseudos, setCopiedPseudos] = useState<CopiedRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCopied()
  }, [])

  const fetchCopied = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('copied_pseudos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setCopiedPseudos(data || [])
    } catch (error) {
      console.error('Error fetching copied pseudos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPseudos = copiedPseudos.filter(p => 
    p.pseudo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
          <Copy className="w-8 h-8 text-twitch-cyan" />
          Pseudos Copiés
        </h1>
        <p className="text-text-secondary font-medium mt-2">
          Historique des 100 derniers pseudos copiés par les utilisateurs
        </p>
      </div>

      <div className="brutal-card p-6 bg-bg-secondary">
        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="brutal-input pl-12"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-twitch-cyan" />
            </div>
          ) : filteredPseudos.length === 0 ? (
            <div className="col-span-full py-12 text-center text-text-muted font-bold uppercase">
              Aucun résultat
            </div>
          ) : (
            filteredPseudos.map((record) => (
              <div key={record.id} className="p-4 border-2 border-[#303032] bg-bg-tertiary hover:border-twitch-cyan transition-colors flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold text-xl text-white mb-1">{record.pseudo}</div>
                  <div className="text-xs font-medium text-text-muted">
                    {new Date(record.created_at).toLocaleString('fr-FR')}
                  </div>
                </div>
                <div className="w-10 h-10 bg-twitch-cyan/10 border border-twitch-cyan/30 flex items-center justify-center text-twitch-cyan">
                  <Copy className="w-5 h-5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
