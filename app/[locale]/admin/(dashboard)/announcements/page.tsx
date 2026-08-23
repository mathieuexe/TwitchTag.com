'use client'

import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { Megaphone, Plus, Loader2, Trash2, Edit2 } from 'lucide-react'
import { Announcement } from '@/types'

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette annonce ?')) return
    try {
      await supabaseClient.from('announcements').delete().eq('id', id)
      setAnnouncements(announcements.filter(a => a.id !== id))
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabaseClient
        .from('announcements')
        .update({ is_active: !currentStatus })
        .eq('id', id)
      
      if (error) throw error
      
      setAnnouncements(announcements.map(a => 
        a.id === id ? { ...a, isActive: !currentStatus } : a
      ))
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-twitch-pink" />
            Annonces
          </h1>
          <p className="text-text-secondary font-medium mt-2">
            Gérer les messages affichés aux utilisateurs
          </p>
        </div>
        <button className="brutal-btn bg-twitch-pink text-black py-3">
          <Plus className="w-5 h-5" />
          Nouvelle Annonce
        </button>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="brutal-card p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-twitch-pink" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="brutal-card p-12 text-center text-text-muted font-bold uppercase">
            Aucune annonce configurée
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className={`brutal-card p-6 ${!announcement.isActive && 'opacity-60'}`}>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                      {announcement.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-bold uppercase border ${
                      announcement.type === 'info' ? 'bg-twitch-cyan/20 text-twitch-cyan border-twitch-cyan/30' :
                      announcement.type === 'success' ? 'bg-twitch-green/20 text-twitch-green border-twitch-green/30' :
                      announcement.type === 'warning' ? 'bg-twitch-yellow/20 text-twitch-yellow border-twitch-yellow/30' :
                      'bg-twitch-pink/20 text-twitch-pink border-twitch-pink/30'
                    }`}>
                      {announcement.type}
                    </span>
                  </div>
                  <p className="text-text-secondary font-medium mb-4">{announcement.content}</p>
                  <div className="text-sm font-bold text-text-muted">
                    Créée le {new Date(announcement.createdAt || '').toLocaleDateString('fr-FR')}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => toggleActive(announcement.id!, announcement.isActive)}
                    className={`px-4 py-2 font-bold uppercase text-xs border-2 border-black shadow-brutal-sm transition-transform hover:-translate-y-1 ${
                      announcement.isActive ? 'bg-twitch-green text-black' : 'bg-bg-tertiary text-white'
                    }`}
                  >
                    {announcement.isActive ? 'Actif' : 'Inactif'}
                  </button>
                  <div className="flex gap-2">
                    <button className="flex-1 p-2 bg-bg-tertiary border-2 border-[#303032] hover:border-white hover:text-white text-text-secondary transition-colors flex justify-center">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(announcement.id!)}
                      className="flex-1 p-2 bg-bg-tertiary border-2 border-[#303032] hover:border-twitch-pink hover:text-twitch-pink hover:bg-twitch-pink/10 transition-colors flex justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
