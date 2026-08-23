'use client'

import { useState, useEffect, useRef } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { Send, Users, User, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'

interface ChatMessage {
  id: string
  username: string
  content: string
  created_at: string
}

interface OnlineUser {
  username: string
  online_at: string
}

const QUICK_EMOJIS = ['😂', '❤️', '🔥', 'GG', '🎮', '💀', '👀']

export default function ChatPage() {
  const [isJoined, setIsJoined] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [username, setUsername] = useState('')
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [channel, setChannel] = useState<any>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Join Chat
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usernameInput.trim()) return
    
    setUsername(usernameInput.trim())
    setIsJoined(true)
  }

  // Setup Realtime once joined
  useEffect(() => {
    if (!isJoined || !username) return

    // Load initial messages
    const loadMessages = async () => {
      const { data } = await supabaseClient
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (data) {
        setMessages(data.reverse())
      }
    }
    loadMessages()

    // Setup Realtime Channel for Presence & Messages
    const chatChannel = supabaseClient.channel('public:chat_room')

    chatChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = chatChannel.presenceState()
        const users: OnlineUser[] = []
        for (const id in presenceState) {
          // get the first presence instance for each user id
          const presence = presenceState[id][0] as any
          users.push({ username: presence.username, online_at: presence.online_at })
        }
        // sort by online_at
        users.sort((a, b) => new Date(b.online_at).getTime() - new Date(a.online_at).getTime())
        setOnlineUsers(users)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMessage])
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await chatChannel.track({
            username: username,
            online_at: new Date().toISOString(),
          })
        }
      })

    setChannel(chatChannel)

    return () => {
      chatChannel.unsubscribe()
    }
  }, [isJoined, username])

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    const content = newMessage.trim()
    if (!content) return

    // Optimistic UI could be added here, but we'll wait for server to ensure order
    setNewMessage('')
    
    await supabaseClient.from('chat_messages').insert({
      username,
      content
    })
  }

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + (prev.length > 0 && !prev.endsWith(' ') ? ' ' : '') + emoji)
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
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Ton Pseudo
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
            <button type="submit" className="w-full twitch-btn py-3 text-lg">
              Rejoindre le chat
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-8rem)] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
      
      {/* Left Sidebar - Online Users */}
      <div className="hidden md:flex flex-col w-64 twitch-card bg-bg-secondary overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-2">
          <Users className="w-5 h-5 text-twitch-purple" />
          <h2 className="font-bold text-white uppercase tracking-wider text-sm">
            En ligne ({onlineUsers.length})
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
          {onlineUsers.map((u, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-bg-input flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-text-muted" />
              </div>
              <span className={`text-sm font-semibold truncate ${u.username === username ? 'text-twitch-purple' : 'text-text-primary'}`}>
                {u.username}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col twitch-card bg-bg-secondary overflow-hidden relative">
        
        {/* Mobile Online Count Header */}
        <div className="md:hidden p-3 border-b border-white/5 flex items-center justify-center gap-2 text-xs font-semibold text-text-muted uppercase">
          <Users className="w-4 h-4" />
          {onlineUsers.length} membre(s) en ligne
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className="group flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-text-muted">
                  {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className={`font-bold text-sm ${msg.username === username ? 'text-twitch-purple' : 'text-white'}`}>
                  {msg.username}
                </span>
                <span className="text-text-primary text-sm break-words">
                  {msg.content}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5 bg-bg-primary/50">
          
          {/* Quick Emojis */}
          <div className="flex gap-2 mb-3 overflow-x-auto hide-scrollbar pb-1">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
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
              placeholder="Envoyer un message..."
              className="twitch-input flex-1"
              maxLength={200}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="twitch-btn px-6 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}