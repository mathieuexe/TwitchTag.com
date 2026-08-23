'use client'

import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { Announcement } from '@/types'
import { X, Megaphone, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function GlobalAnnouncements() {
  const [activeAnnouncements, setActiveAnnouncements] = useState<Announcement[]>([])
  const [dismissedIds, setDismissedIds] = useState<string[]>([])

  useEffect(() => {
    // Load dismissed announcements from localStorage
    const saved = localStorage.getItem('dismissed_announcements')
    if (saved) {
      try {
        setDismissedIds(JSON.parse(saved))
      } catch (e) {
        // ignore
      }
    }

    fetchAnnouncements()

    // Subscribe to realtime changes
    const channel = supabaseClient
      .channel('public:announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        fetchAnnouncements()
      })
      .subscribe()

    return () => {
      supabaseClient.removeChannel(channel)
    }
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const mappedData: Announcement[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        type: item.type as any,
        isActive: item.is_active,
        createdAt: item.created_at,
      }))

      setActiveAnnouncements(mappedData)
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  const dismiss = (id: string) => {
    const newDismissed = [...dismissedIds, id]
    setDismissedIds(newDismissed)
    localStorage.setItem('dismissed_announcements', JSON.stringify(newDismissed))
  }

  const visibleAnnouncements = activeAnnouncements.filter(a => !dismissedIds.includes(a.id!))

  if (visibleAnnouncements.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-4 max-w-sm w-full pointer-events-none px-4">
      <AnimatePresence>
        {visibleAnnouncements.map(announcement => {
          
          let bgColor = 'bg-twitch-cyan/10'
          let borderColor = 'border-twitch-cyan'
          let textColor = 'text-twitch-cyan'
          let Icon = Info

          if (announcement.type === 'success') {
            bgColor = 'bg-twitch-green/10'
            borderColor = 'border-twitch-green'
            textColor = 'text-twitch-green'
            Icon = CheckCircle2
          } else if (announcement.type === 'warning') {
            bgColor = 'bg-twitch-yellow/10'
            borderColor = 'border-twitch-yellow'
            textColor = 'text-twitch-yellow'
            Icon = AlertCircle
          } else if (announcement.type === 'error') {
            bgColor = 'bg-twitch-pink/10'
            borderColor = 'border-twitch-pink'
            textColor = 'text-twitch-pink'
            Icon = AlertCircle
          }

          return (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 100 }}
              className={`pointer-events-auto flex flex-col p-4 border-l-4 ${borderColor} bg-[#18181B] shadow-2xl relative overflow-hidden`}
            >
              <div className={`absolute top-0 left-0 w-full h-full ${bgColor} pointer-events-none`} />
              
              <div className="relative z-10 flex items-start gap-3">
                <div className={`mt-1 ${textColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 pr-6">
                  <h4 className="font-bold text-white uppercase text-sm tracking-wide mb-1">
                    {announcement.title}
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {announcement.content}
                  </p>
                </div>
                <button 
                  onClick={() => dismiss(announcement.id!)}
                  className="absolute top-0 right-0 p-2 text-text-muted hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
