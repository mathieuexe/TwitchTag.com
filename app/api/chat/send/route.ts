import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, avatar_url, content } = await req.json()
    
    // Get client IP for banning system
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

    const session = await getServerSession(authOptions)
    const isAdmin = !!session

    // Protect "admin" usernames
    if (!isAdmin) {
      if (username.toLowerCase() === 'admin') {
        return NextResponse.json({ error: 'Ce pseudo est réservé aux administrateurs.' }, { status: 403 })
      }
      
      const { data: adminMatch } = await supabaseServer
        .from('admin_users')
        .select('name')
        .ilike('name', username)
        .maybeSingle()
        
      if (adminMatch) {
        return NextResponse.json({ error: 'Ce pseudo est réservé aux administrateurs.' }, { status: 403 })
      }
    }

    // 1. Check if chat is disabled
    const { data: settings } = await supabaseServer.from('chat_settings').select('is_disabled').eq('id', 1).maybeSingle()
    if (settings && (settings as any).is_disabled) {
      // Allow admins to bypass the chat lock
      if (!isAdmin) {
        return NextResponse.json({ error: 'Le chat est actuellement désactivé.' }, { status: 403 })
      }
    }

    // 2. Check if user is banned
    const { data: ban } = await supabaseServer.from('chat_bans').select('*').eq('ip_address', ip).maybeSingle()
    if (ban) {
      return NextResponse.json({ error: `Vous êtes banni du chat. Raison : ${(ban as any).reason || 'Aucune'}` }, { status: 403 })
    }

    // 3. Insert message securely via backend
    const { data, error } = await supabaseServer.from('chat_messages').insert({
      username,
      avatar_url: avatar_url || null,
      content,
      ip_address: ip
    } as any).select().single()

    if (error) throw error

    return NextResponse.json({ success: true, message: data })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Erreur interne lors de l\'envoi' }, { status: 500 })
  }
}