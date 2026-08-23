'use client'

import { useState, useEffect, useRef } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { Send, Users, User, MessageSquare, Shield, Trash2, Ban, Lock, Unlock, Pin, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { getSession } from 'next-auth/react'

interface ChatMessage {
  id: string
  username: string
  avatar_url?: string
  content: string
  created_at: string
}

interface OnlineUser {
  username: string
  avatar_url?: string
  online_at: string
  is_admin?: boolean
  status?: 'online' | 'away' | 'dnd'
}

const QUICK_EMOJIS = ['😂', '❤️', '🔥', 'GG', '🎮', '💀', '👀']

export default function ChatPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [avatarUrlInput, setAvatarUrlInput] = useState('')
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [channel, setChannel] = useState<any>(null)
  
  // Profile & Status
  const [userStatus, setUserStatus] = useState<'online' | 'away' | 'dnd'>('online')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  
  const [chatSettings, setChatSettings] = useState<{ is_disabled: boolean, pinned_message: string | null }>({
    is_disabled: false,
    pinned_message: null
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initAuth = async () => {
      const session = await getSession()
      if (session && session.user) {
        setIsAdmin(true)
        setUsername(session.user.name || 'Admin')
        // We do not set avatarUrl to a default, but if it exists in session we could
        setIsJoined(true)
      }
    }
    initAuth()
  }, [])

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Join Chat
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usernameInput.trim()) return
    
    setUsername(usernameInput.trim())
    setAvatarUrl(avatarUrlInput.trim())
    setIsJoined(true)
  }

  // Setup Realtime once joined
  useEffect(() => {
    if (!isJoined || !username) return

    const loadInitialData = async () => {
      // Load initial messages
      const { data: msgs } = await supabaseClient
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (msgs) setMessages(msgs.reverse())

      // Load chat settings
      const { data: settings } = await supabaseClient
        .from('chat_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle()
      
      if (settings) setChatSettings({ is_disabled: settings.is_disabled, pinned_message: settings.pinned_message })
    }
    loadInitialData()

    // Setup Realtime Channel for Presence & Messages
    const chatChannel = supabaseClient.channel('public:chat_room')

    chatChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = chatChannel.presenceState()
        const users: OnlineUser[] = []
        for (const id in presenceState) {
          const presence = presenceState[id][0] as any
          users.push({ 
            username: presence.username, 
            avatar_url: presence.avatar_url,
            online_at: presence.online_at,
            is_admin: presence.is_admin,
            status: presence.status || 'online'
          })
        }
        // sort by online_at, but put admins at the top
        users.sort((a, b) => {
          if (a.is_admin && !b.is_admin) return -1
          if (!a.is_admin && b.is_admin) return 1
          return new Date(b.online_at).getTime() - new Date(a.online_at).getTime()
        })
        setOnlineUsers(users)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMessage])
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_messages' }, (payload) => {
        setMessages((prev) => prev.filter(m => m.id !== payload.old.id))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_settings' }, (payload) => {
        setChatSettings({
          is_disabled: payload.new.is_disabled,
          pinned_message: payload.new.pinned_message
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await chatChannel.track({
            username: username,
            avatar_url: avatarUrl,
            online_at: new Date().toISOString(),
            is_admin: isAdmin,
            status: userStatus
          })
        }
      })

    setChannel(chatChannel)

    return () => {
      chatChannel.unsubscribe()
    }
  }, [isJoined, username, isAdmin]) // Intentionally not tracking avatarUrl/userStatus here so it doesn't re-subscribe

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setAvatarUrl(editAvatarUrl)
    setShowProfileModal(false)
    if (channel) {
      await channel.track({
        username: username,
        avatar_url: editAvatarUrl,
        online_at: new Date().toISOString(),
        is_admin: isAdmin,
        status: userStatus
      })
    }
  }

  const updateStatus = async (newStatus: 'online' | 'away' | 'dnd') => {
    setUserStatus(newStatus)
    if (channel) {
      await channel.track({
        username: username,
        avatar_url: avatarUrl,
        online_at: new Date().toISOString(),
        is_admin: isAdmin,
        status: newStatus
      })
    }
  }

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (chatSettings.is_disabled && !isAdmin) return

    const content = newMessage.trim()
    if (!content) return

    setNewMessage('')
    
    // We call our API route to send message securely
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, avatar_url: avatarUrl || null, content })
      })
      
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Erreur lors de l'envoi")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + (prev.length > 0 && !prev.endsWith(' ') ? ' ' : '') + emoji)
  }

  const adminAction = async (action: string, payload: any = {}) => {
    try {
      const res = await fetch('/api/chat/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
      })
      if (!res.ok) throw new Error('Action failed')
    } catch (error) {
      console.error(error)
      alert("Erreur lors de l'action admin")
    }
  }

  if (!isJoined) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-12rem)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="twitch-card p-8 w-full max-w-md bg-bg-secondary"
        >
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-twitch-purple rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider">
              Chat en direct
            </h1>
            <p className="text-text-muted mt-2 text-sm">
              Connecte-toi avec un pseudo pour discuter avec la communauté.
            </p>
            {isAdmin && (
              <div className="mt-4 inline-flex items-center gap-2 bg-red-500/20 text-red-500 px-3 py-1 rounded-md text-sm font-bold border border-red-500/30">
                <Shield className="w-4 h-4" /> Mode Administrateur
              </div>
            )}
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Ton Pseudo *
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                maxLength={20}
                className="twitch-input"
                placeholder="Ex: Ninja..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                URL d'Avatar (Optionnel)
              </label>
              <input
                type="url"
                value={avatarUrlInput}
                onChange={(e) => setAvatarUrlInput(e.target.value)}
                className="twitch-input"
                placeholder="https://..."
              />
              <p className="text-xs text-text-muted mt-2">Lien vers une image PNG, JPG ou GIF.</p>
            </div>

            <button type="submit" className="w-full twitch-btn py-3 text-lg mt-4">
              Rejoindre le chat
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <>
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-8rem)] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
      
      {/* Left Sidebar - Online Users */}
      <div className="hidden md:flex flex-col w-64 twitch-card bg-bg-secondary overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-white/5 flex items-center gap-2">
          <Users className="w-5 h-5 text-twitch-purple" />
          <h2 className="font-bold text-white uppercase tracking-wider text-sm">
            En ligne ({onlineUsers.length})
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
          {onlineUsers.map((u, i) => {
            let statusColor = 'bg-twitch-green'
            if (u.status === 'away') statusColor = 'bg-twitch-yellow'
            if (u.status === 'dnd') statusColor = 'bg-twitch-pink'

            return (
            <div 
              key={i} 
              className={`flex items-center gap-3 ${u.username === username ? 'cursor-pointer hover:bg-white/5 p-1 -m-1 rounded-md transition-colors' : ''}`}
              onClick={() => {
                if (u.username === username) {
                  setEditAvatarUrl(avatarUrl)
                  setShowProfileModal(true)
                }
              }}
              title={u.username === username ? "Modifier mon profil" : ""}
            >
              <div className="relative">
                {u.avatar_url ? (
                  <img 
                    src={u.avatar_url} 
                    alt={u.username} 
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 bg-bg-input"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-bg-input flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-text-muted" />
                  </div>
                )}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-bg-secondary ${statusColor}`}></div>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className={`text-sm font-semibold truncate ${u.username === username ? 'text-twitch-purple' : 'text-text-primary'}`}>
                  {u.username}
                </span>
                {u.is_admin && (
                  <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
            </div>
          )})}
        </div>
        
        {/* Admin Global Controls */}
        {isAdmin && (
          <div className="p-4 border-t border-white/5 bg-bg-primary/30 flex flex-col gap-2">
            <button 
              onClick={() => adminAction('toggle_chat', { is_disabled: !chatSettings.is_disabled })}
              className="flex items-center gap-2 text-xs font-bold px-3 py-2 bg-bg-input hover:bg-white/10 rounded-md transition-colors w-full"
            >
              {chatSettings.is_disabled ? <Unlock className="w-4 h-4 text-green-400" /> : <Lock className="w-4 h-4 text-red-400" />}
              {chatSettings.is_disabled ? 'Activer le chat' : 'Désactiver le chat'}
            </button>
            <button 
              onClick={() => {
                if(confirm('Es-tu sûr de vouloir effacer tout le chat ?')) {
                  adminAction('clear_chat')
                }
              }}
              className="flex items-center gap-2 text-xs font-bold px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition-colors w-full"
            >
              <Trash2 className="w-4 h-4" /> Clear le chat
            </button>
            <button 
              onClick={() => {
                const msg = prompt('Message à épingler ? (Laisser vide pour désépingler)')
                adminAction('pin_message', { message: msg || null })
              }}
              className="flex items-center gap-2 text-xs font-bold px-3 py-2 bg-twitch-purple/10 hover:bg-twitch-purple/20 text-twitch-purple rounded-md transition-colors w-full"
            >
              <Pin className="w-4 h-4" /> Épingler un message
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col twitch-card bg-bg-secondary overflow-hidden relative">
        
        {/* Mobile Online Count Header */}
        <div className="md:hidden p-3 border-b border-white/5 flex items-center justify-center gap-2 text-xs font-semibold text-text-muted uppercase">
          <Users className="w-4 h-4" />
          {onlineUsers.length} membre(s) en ligne
        </div>

        {/* Pinned Message */}
        {chatSettings.pinned_message && (
          <div className="bg-twitch-purple/10 border-b border-twitch-purple/30 p-3 flex items-start gap-3">
            <Pin className="w-5 h-5 text-twitch-purple mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-xs font-bold text-twitch-purple uppercase tracking-wider block mb-0.5">Message Épinglé</span>
              <p className="text-sm text-white font-medium break-words">{chatSettings.pinned_message}</p>
            </div>
            {isAdmin && (
              <button onClick={() => adminAction('pin_message', { message: null })} className="text-text-muted hover:text-white transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
          {messages.map((msg) => {
            const onlineUser = onlineUsers.find(u => u.username === msg.username)
            const displayAvatar = onlineUser?.avatar_url || msg.avatar_url

            return (
            <div key={msg.id} className="group flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-text-muted">
                  {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                
                {displayAvatar && (
                  <img 
                    src={displayAvatar} 
                    alt={msg.username} 
                    className="w-5 h-5 rounded-full object-cover self-center ml-1 bg-bg-input"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )}
                
                <span className={`font-bold text-sm ${msg.username === username ? 'text-twitch-purple' : 'text-white'}`}>
                  {msg.username}
                </span>
                <span className="text-text-primary text-sm break-words flex-1">
                  {msg.content}
                </span>
                
                {/* Admin Message Controls */}
                {isAdmin && (
                  <div className="hidden group-hover:flex items-center gap-1 bg-bg-primary rounded px-1 ml-2">
                    <button 
                      onClick={() => adminAction('delete_message', { id: msg.id })}
                      className="p-1 text-text-muted hover:text-red-400 transition-colors"
                      title="Supprimer le message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => {
                        const reason = prompt(`Raison du ban pour ${msg.username} ?`)
                        if(reason !== null) adminAction('ban_user', { message_id: msg.id, reason })
                      }}
                      className="p-1 text-text-muted hover:text-red-400 transition-colors"
                      title="Bannir l'utilisateur (IP)"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )})}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5 bg-bg-primary/50">
          
          {/* Quick Emojis */}
          <div className={`flex gap-2 mb-3 overflow-x-auto hide-scrollbar pb-1 ${(chatSettings.is_disabled && !isAdmin) ? 'opacity-50 pointer-events-none' : ''}`}>
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                disabled={chatSettings.is_disabled && !isAdmin}
                className="flex-shrink-0 px-3 py-1.5 bg-bg-input hover:bg-white/10 rounded-md text-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>

          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={chatSettings.is_disabled && !isAdmin ? "Le chat est temporairement désactivé." : "Envoyer un message..."}
              className="twitch-input flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={200}
              disabled={chatSettings.is_disabled && !isAdmin}
            />
            <button
              type="submit"
              disabled={(!newMessage.trim()) || (chatSettings.is_disabled && !isAdmin)}
              className="twitch-btn px-6 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
    
    {/* Profile Modal */}
    {showProfileModal && (
      <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="twitch-card bg-bg-secondary w-full max-w-sm p-6 relative border-t-4 border-twitch-purple"
        >
          <button 
            onClick={() => setShowProfileModal(false)} 
            className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
          
          <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-twitch-purple" /> Mon Profil
          </h3>
          
          <div className="space-y-6">
            {/* Status Selection */}
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Statut Actuel</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateStatus('online')} 
                  className={`flex-1 py-2 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${userStatus === 'online' ? 'bg-twitch-green/20 text-twitch-green border border-twitch-green/50' : 'bg-bg-input text-text-muted hover:bg-white/10 hover:text-white'}`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-twitch-green"></div> En ligne
                </button>
                <button 
                  onClick={() => updateStatus('away')} 
                  className={`flex-1 py-2 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${userStatus === 'away' ? 'bg-twitch-yellow/20 text-twitch-yellow border border-twitch-yellow/50' : 'bg-bg-input text-text-muted hover:bg-white/10 hover:text-white'}`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-twitch-yellow"></div> Absent
                </button>
                <button 
                  onClick={() => updateStatus('dnd')} 
                  className={`flex-1 py-2 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${userStatus === 'dnd' ? 'bg-twitch-pink/20 text-twitch-pink border border-twitch-pink/50' : 'bg-bg-input text-text-muted hover:bg-white/10 hover:text-white'}`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-twitch-pink"></div> Occupé
                </button>
              </div>
            </div>

            {/* Avatar Update Form */}
            <form onSubmit={updateProfile}>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">URL d'Avatar</label>
              <input 
                type="url" 
                value={editAvatarUrl} 
                onChange={e => setEditAvatarUrl(e.target.value)} 
                className="twitch-input mb-4" 
                placeholder="https://..." 
              />
              <button type="submit" className="twitch-btn w-full py-2.5 text-sm">
                Sauvegarder
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    )}
    </>
  )
}