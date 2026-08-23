'use client'

import { useState, useEffect, useRef } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { Send, Users, User, MessageSquare, Shield, Trash2, Ban, Lock, Unlock, Pin, XCircle, BarChart2, Plus, Minus, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { getSession } from 'next-auth/react'

interface ChatMessage {
  id: string
  username: string
  avatar_url?: string
  content: string
  created_at: string
  name_color?: string
  is_deleted?: boolean
  is_poll?: boolean
  poll_data?: {
    question: string
    options: { text: string, votes: number }[]
    voted_ips: string[]
  }
}

interface OnlineUser {
  username: string
  avatar_url?: string
  online_at: string
  is_admin?: boolean
  status?: 'online' | 'away' | 'dnd'
  name_color?: string
}

const QUICK_EMOJIS = ['😂', '❤️', '🔥', 'GG', '🎮', '💀', '👀']
const TWITCH_COLORS = [
  '#FF0000', '#0000FF', '#008000', '#B22222', '#FF7F50',
  '#9ACD32', '#FF4500', '#2E8B57', '#DAA520', '#D2691E',
  '#5F9EA0', '#1E90FF', '#FF69B4', '#8A2BE2', '#00FF7F',
  '#9146FF'
]

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
  const [nameColor, setNameColor] = useState('#9146FF')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [editNameColor, setEditNameColor] = useState('#9146FF')
  
  // Poll Modal
  const [showPollModal, setShowPollModal] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [pinPoll, setPinPoll] = useState(false)
  
  // GIF Modal
  const [showGifModal, setShowGifModal] = useState(false)
  const [gifQuery, setGifQuery] = useState('')
  const [gifResults, setGifResults] = useState<any[]>([])
  const [isSearchingGif, setIsSearchingGif] = useState(false)
  
  const [chatSettings, setChatSettings] = useState<{ is_disabled: boolean, pinned_message: string | null }>({
    is_disabled: false,
    pinned_message: null
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedAvatar = localStorage.getItem('chat_avatar_url')
    const savedStatus = localStorage.getItem('chat_user_status') as 'online' | 'away' | 'dnd'
    const savedColor = localStorage.getItem('chat_name_color')
    if (savedAvatar) {
      setAvatarUrl(savedAvatar)
      setAvatarUrlInput(savedAvatar)
    }
    if (savedStatus) setUserStatus(savedStatus)
    if (savedColor) setNameColor(savedColor)

    const initAuth = async () => {
      const session = await getSession()
      if (session && session.user) {
        setIsAdmin(true)
        setUsername(session.user.name || 'Admin')
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
    
    const lowerInput = usernameInput.trim().toLowerCase()
    const isAdminVariant = lowerInput === 'admin' || lowerInput.startsWith('admin')
    
    if (isAdminVariant && !isAdmin) {
      alert("Ce pseudo est réservé aux administrateurs.")
      return
    }

    setUsername(usernameInput.trim())
    const finalAvatar = avatarUrlInput.trim()
    setAvatarUrl(finalAvatar)
    if (finalAvatar) localStorage.setItem('chat_avatar_url', finalAvatar)
    setIsJoined(true)
  }

  const handleAnonymousJoin = () => {
    const randomNum = Math.floor(Math.random() * 1000) + 1
    const anonName = `anonyme-${randomNum}`
    setUsername(anonName)
    setAvatarUrl('')
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
            status: presence.status || 'online',
            name_color: presence.name_color || '#9146FF'
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
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages' }, (payload) => {
        setMessages((prev) => prev.map(m => m.id === payload.new.id ? payload.new as ChatMessage : m))
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
            status: userStatus,
            name_color: nameColor
          })
        }
      })

    setChannel(chatChannel)

    return () => {
      chatChannel.unsubscribe()
    }
  }, [isJoined, username, isAdmin]) // Intentionally not tracking avatarUrl/userStatus/nameColor here so it doesn't re-subscribe

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setAvatarUrl(editAvatarUrl)
    setNameColor(editNameColor)
    localStorage.setItem('chat_avatar_url', editAvatarUrl)
    localStorage.setItem('chat_name_color', editNameColor)
    setShowProfileModal(false)
    if (channel) {
      await channel.track({
        username: username,
        avatar_url: editAvatarUrl,
        online_at: new Date().toISOString(),
        is_admin: isAdmin,
        status: userStatus,
        name_color: editNameColor
      })
    }
  }

  const updateStatus = async (newStatus: 'online' | 'away' | 'dnd') => {
    setUserStatus(newStatus)
    localStorage.setItem('chat_user_status', newStatus)
    if (channel) {
      await channel.track({
        username: username,
        avatar_url: avatarUrl,
        online_at: new Date().toISOString(),
        is_admin: isAdmin,
        status: newStatus,
        name_color: nameColor
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
        body: JSON.stringify({ username, avatar_url: avatarUrl || null, content, name_color: nameColor })
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

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pollQuestion.trim() || pollOptions.some(o => !o.trim())) return
    
    adminAction('create_poll', {
      question: pollQuestion,
      options: pollOptions.filter(o => o.trim()),
      pin_poll: pinPoll,
      username,
      avatar_url: avatarUrl,
      name_color: nameColor
    })
    
    setShowPollModal(false)
    setPollQuestion('')
    setPollOptions(['', ''])
    setPinPoll(false)
  }

  const handleVote = async (messageId: string, optionIndex: number) => {
    try {
      const res = await fetch('/api/chat/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, option_index: optionIndex })
      })
      const data = await res.json()
      if (!res.ok) alert(data.error)
    } catch (err) {
      console.error(err)
    }
  }

  // GIF Functions
  useEffect(() => {
    if (showGifModal) {
      searchGifs('')
    }
  }, [showGifModal])

  const searchGifs = async (query: string) => {
    setIsSearchingGif(true)
    try {
      const GIPHY_API_KEY = 'TSAciiELUMKaaSiw68yhdkwIsPPr0dMd'
      const endpoint = query 
        ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20`
      const res = await fetch(endpoint)
      const data = await res.json()
      setGifResults(data.data || [])
    } catch (err) {
      console.error(err)
    }
    setIsSearchingGif(false)
  }

  const sendGif = async (gifUrl: string) => {
    setShowGifModal(false)
    if (chatSettings.is_disabled && !isAdmin) return
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, avatar_url: avatarUrl || null, content: gifUrl, name_color: nameColor })
      })
      if (!res.ok) alert("Erreur lors de l'envoi du GIF")
    } catch (err) {
      console.error(err)
    }
  }

  const renderMessageContent = (content: string, isDeleted?: boolean) => {
    if (isDeleted) return <span className="text-sm text-text-muted italic break-words flex-1">{content}</span>

    // Is it a GIF?
    if (content.match(/^https:\/\/media\d*\.giphy\.com\/media\//) || content.match(/^https:\/\/media\.giphy\.com\/media\//)) {
      return (
        <div className="mt-1 flex-1">
          <img src={content} alt="GIF" className="max-w-[200px] max-h-[200px] rounded-md object-contain bg-bg-input" loading="lazy" />
        </div>
      )
    }

    // Parse links
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = content.split(urlRegex)
    
    return (
      <span className="text-sm text-text-primary break-words flex-1">
        {parts.map((part, i) => {
          if (part.match(urlRegex)) {
            return (
              <a 
                key={i} 
                href={part} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-twitch-purple hover:underline break-all font-semibold"
              >
                {part}
              </a>
            )
          }
          return <span key={i}>{part}</span>
        })}
      </span>
    )
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

            <div className="flex flex-col gap-3 mt-4">
              <button type="submit" className="w-full twitch-btn py-3 text-lg">
                Rejoindre le chat
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-text-muted text-xs uppercase font-semibold">OU</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <button 
                type="button" 
                onClick={handleAnonymousJoin}
                className="w-full bg-bg-input hover:bg-white/10 text-white font-semibold py-3 rounded-md transition-colors border border-white/10"
              >
                Rejoindre en anonyme
              </button>
            </div>
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
            let statusText = 'En ligne'
            if (u.status === 'away') {
              statusColor = 'bg-orange-500'
              statusText = 'Absent'
            }
            if (u.status === 'dnd') {
              statusColor = 'bg-red-600'
              statusText = 'Occupé'
            }

            return (
            <div 
              key={i} 
              className={`flex items-center gap-3 ${u.username === username ? 'cursor-pointer hover:bg-white/5 p-1 -m-1 rounded-md transition-colors' : ''}`}
              onClick={() => {
                if (u.username === username) {
                  setEditAvatarUrl(avatarUrl)
                  setEditNameColor(nameColor)
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
                <div 
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-bg-secondary ${statusColor}`}
                  title={statusText}
                ></div>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span 
                  className={`text-sm font-semibold truncate`}
                  style={{ color: u.name_color || (u.username === username ? '#9146FF' : '#ffffff') }}
                >
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
            <button 
              onClick={() => setShowPollModal(true)}
              className="flex items-center gap-2 text-xs font-bold px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-md transition-colors w-full"
            >
              <BarChart2 className="w-4 h-4" /> Créer un sondage
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
            
            let statusColor = 'bg-gray-500'
            let statusText = 'Hors ligne'
            if (onlineUser) {
              statusColor = 'bg-twitch-green'
              statusText = 'En ligne'
              if (onlineUser.status === 'away') {
                statusColor = 'bg-orange-500'
                statusText = 'Absent'
              }
              if (onlineUser.status === 'dnd') {
                statusColor = 'bg-red-600'
                statusText = 'Occupé'
              }
            }

            return (
            <div key={msg.id} className="group flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-text-muted">
                  {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                
                <div className="relative self-center ml-1 flex-shrink-0" title={statusText}>
                  {displayAvatar ? (
                    <img 
                      src={displayAvatar} 
                      alt={msg.username} 
                      className={`w-5 h-5 rounded-full object-cover bg-bg-input ${msg.is_deleted ? 'opacity-50' : ''}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.username}`
                      }}
                    />
                  ) : (
                    <div className={`w-5 h-5 rounded-full bg-bg-input flex items-center justify-center ${msg.is_deleted ? 'opacity-50' : ''}`}>
                      <User className="w-3 h-3 text-text-muted" />
                    </div>
                  )}
                  {onlineUser && (
                    <div 
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-bg-secondary ${statusColor}`}
                    ></div>
                  )}
                </div>
                
                <span 
                  className={`font-bold text-sm ${msg.is_deleted ? 'opacity-50' : ''}`}
                  style={{ color: msg.name_color || onlineUser?.name_color || (msg.username === username ? '#9146FF' : '#ffffff') }}
                >
                  {msg.username}
                </span>

                {msg.is_poll && msg.poll_data ? (
                  <div className={`flex-1 ml-2 bg-bg-primary/50 border border-white/10 rounded-lg p-3 ${msg.is_deleted ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart2 className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-sm text-white">Sondage : {msg.poll_data.question}</span>
                    </div>
                    <div className="space-y-2">
                      {msg.poll_data.options.map((opt, idx) => {
                        const totalVotes = msg.poll_data!.options.reduce((sum, o) => sum + o.votes, 0)
                        const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0
                        return (
                          <div key={idx} className="relative overflow-hidden rounded-md bg-bg-input">
                            <div 
                              className="absolute inset-y-0 left-0 bg-blue-500/30 transition-all duration-500" 
                              style={{ width: `${percent}%` }}
                            />
                            <button
                              onClick={() => handleVote(msg.id, idx)}
                              disabled={msg.is_deleted}
                              className="relative w-full flex justify-between items-center px-3 py-2 text-xs font-semibold text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span>{opt.text}</span>
                              <span className="text-text-muted">{percent}% ({opt.votes})</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-2 text-[10px] text-text-muted uppercase tracking-wider">
                      {msg.poll_data.voted_ips?.length || 0} participant(s)
                    </div>
                  </div>
                ) : (
                  renderMessageContent(msg.content, msg.is_deleted)
                )}
                
                {/* Admin Message Controls */}
                {(isAdmin && !msg.is_deleted) && (
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
            <button
              type="button"
              onClick={() => setShowGifModal(true)}
              disabled={chatSettings.is_disabled && !isAdmin}
              className="flex-shrink-0 px-3 py-1.5 bg-twitch-purple/20 text-twitch-purple hover:bg-twitch-purple/30 rounded-md text-xs font-bold transition-colors flex items-center justify-center uppercase"
            >
              GIF
            </button>
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
    
    {/* Poll Modal */}
    {showPollModal && (
      <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="twitch-card bg-bg-secondary w-full max-w-sm p-6 relative border-t-4 border-blue-500"
        >
          <button 
            onClick={() => setShowPollModal(false)} 
            className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
          
          <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-blue-500" /> Nouveau Sondage
          </h3>

          <form onSubmit={handleCreatePoll} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Question</label>
              <input
                type="text"
                value={pollQuestion}
                onChange={e => setPollQuestion(e.target.value)}
                className="twitch-input"
                placeholder="Ex: Quel jeu ce soir ?"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Options</label>
              <div className="space-y-2">
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={e => {
                        const newOpts = [...pollOptions]
                        newOpts[idx] = e.target.value
                        setPollOptions(newOpts)
                      }}
                      className="twitch-input flex-1"
                      placeholder={`Option ${idx + 1}`}
                      required
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                        className="px-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOptions.length < 5 && (
                <button
                  type="button"
                  onClick={() => setPollOptions([...pollOptions, ''])}
                  className="mt-2 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Ajouter une option
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="pinPoll"
                checked={pinPoll}
                onChange={e => setPinPoll(e.target.checked)}
                className="w-4 h-4 rounded bg-bg-input border-white/10 text-twitch-purple focus:ring-twitch-purple focus:ring-offset-bg-secondary"
              />
              <label htmlFor="pinPoll" className="text-sm font-semibold text-text-secondary cursor-pointer">
                Épingler le sondage
              </label>
            </div>

            <button type="submit" className="w-full twitch-btn bg-blue-500 hover:bg-blue-600 py-2.5 text-sm mt-4">
              Créer le sondage
            </button>
          </form>
        </motion.div>
      </div>
    )}

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
                  type="button"
                  className={`flex-1 py-2 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${userStatus === 'online' ? 'bg-twitch-green/20 text-twitch-green border border-twitch-green/50' : 'bg-bg-input text-text-muted hover:bg-white/10 hover:text-white'}`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-twitch-green"></div> En ligne
                </button>
                <button 
                  onClick={() => updateStatus('away')} 
                  type="button"
                  className={`flex-1 py-2 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${userStatus === 'away' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/50' : 'bg-bg-input text-text-muted hover:bg-white/10 hover:text-white'}`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div> Absent
                </button>
                <button 
                  onClick={() => updateStatus('dnd')} 
                  type="button"
                  className={`flex-1 py-2 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${userStatus === 'dnd' ? 'bg-red-600/20 text-red-600 border border-red-600/50' : 'bg-bg-input text-text-muted hover:bg-white/10 hover:text-white'}`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div> Occupé
                </button>
              </div>
            </div>

            {/* Name Color Selection */}
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Couleur du nom</label>
              <div className="grid grid-cols-8 gap-2">
                {TWITCH_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setEditNameColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform ${editNameColor === color ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-bg-secondary' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
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

    {/* GIF Modal */}
    {showGifModal && (
      <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="twitch-card bg-bg-secondary w-full max-w-2xl p-6 relative border-t-4 border-twitch-purple flex flex-col h-[80vh]"
        >
          <button 
            onClick={() => setShowGifModal(false)} 
            className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors z-10"
          >
            <XCircle className="w-6 h-6" />
          </button>
          
          <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            Rechercher un GIF
          </h3>
          
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-text-muted" />
            </div>
            <input
              type="text"
              value={gifQuery}
              onChange={(e) => {
                setGifQuery(e.target.value)
                searchGifs(e.target.value)
              }}
              placeholder="Rechercher sur Giphy..."
              className="twitch-input pl-10"
            />
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {isSearchingGif ? (
              <div className="flex justify-center items-center h-32">
                <span className="text-text-muted">Recherche...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {gifResults.map((gif) => (
                  <button
                    key={gif.id}
                    onClick={() => sendGif(gif.images.downsized.url)}
                    className="relative aspect-video rounded-md overflow-hidden hover:ring-2 ring-twitch-purple transition-all bg-bg-input group"
                  >
                    <img 
                      src={gif.images.downsized.url} 
                      alt={gif.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-bold text-xs uppercase tracking-wider">Envoyer</span>
                    </div>
                  </button>
                ))}
                {gifResults.length === 0 && (
                  <div className="col-span-full text-center text-text-muted py-8">
                    Aucun GIF trouvé
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    )}
    </>
  )
}