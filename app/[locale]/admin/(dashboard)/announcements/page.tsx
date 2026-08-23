'use client'

import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { Megaphone, Plus, Loader2, Trash2, Edit2, X } from 'lucide-react'
import { Announcement } from '@/types'

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState('info')

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/announcements')
      if (!res.ok) throw new Error('Failed to fetch announcements')
      
      const data = await res.json()
      
      const mappedData: Announcement[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        type: item.type as any,
        isActive: item.is_active,
        createdAt: item.created_at,
      }))
      
      setAnnouncements(mappedData)
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, type, is_active: false })
      })

      if (!res.ok) throw new Error('Failed to create announcement')
      
      const data = await res.json()
      
      const newAnnouncement: Announcement = {
        id: data.id,
        title: data.title,
        content: data.content,
        type: data.type as any,
        isActive: data.is_active,
        createdAt: data.created_at,
      }
      
      setAnnouncements([newAnnouncement, ...announcements])
      setShowForm(false)
      setTitle('')
      setContent('')
      setType('info')
    } catch (error) {
      console.error('Error creating announcement:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette annonce ?')) return
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete')
      setAnnouncements(announcements.filter(a => a.id !== id))
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      })
      
      if (!res.ok) throw new Error('Failed to update status')
      
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
        <button 
          onClick={() => setShowForm(!showForm)}
          className="twitch-btn bg-twitch-pink text-black py-3"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Annuler' : 'Nouvelle Annonce'}
        </button>
      </div>

      {showForm && (
        <div className="twitch-card p-6 bg-bg-secondary border-twitch-pink">
          <h2 className="text-2xl font-black text-white uppercase mb-6">Créer une annonce</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-white uppercase tracking-wider mb-2">Titre</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="twitch-input bg-bg-primary" 
                placeholder="Titre de l'annonce"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white uppercase tracking-wider mb-2">Contenu</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="twitch-input bg-bg-primary min-h-[100px]" 
                placeholder="Contenu du message..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white uppercase tracking-wider mb-2">Type</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="twitch-input bg-bg-primary"
              >
                <option value="info">Info (Cyan)</option>
                <option value="success">Succès (Vert)</option>
                <option value="warning">Attention (Jaune)</option>
                <option value="error">Erreur (Rose)</option>
              </select>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="twitch-btn w-full py-3"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publier'}
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-6">
        {loading ? (
          <div className="twitch-card p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-twitch-pink" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="twitch-card p-12 text-center text-text-muted font-bold uppercase">
            Aucune annonce configurée
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className={`twitch-card p-6 ${!announcement.isActive && 'opacity-60'}`}>
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
