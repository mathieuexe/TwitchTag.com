import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, avatar_url, content, name_color } = await req.json()
    
    // Get client IP for banning system
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

    const session = await getServerSession(authOptions)
    const isAdmin = !!session

    // Protect "admin" usernames
    if (!isAdmin) {
      // Normalize to catch sneaky admin variations (e.g. "a d m i n", "@dmin", "4dmin", "admin_officiel")
      const normalizedUsername = username.toLowerCase().replace(/[4@]/g, 'a').replace(/[1!]/g, 'i').replace(/0/g, 'o')
      const adminRegex = /a[\W_]*d[\W_]*m[\W_]*i[\W_]*n/i
      
      if (adminRegex.test(normalizedUsername)) {
        return NextResponse.json({ error: 'L\'utilisation du mot "admin" dans le pseudo est strictement réservée.' }, { status: 403 })
      }
      
      const { data: adminMatch, error: adminErr } = await supabaseServer
        .from('admin_users')
        .select('name')
        .ilike('name', username)
        .limit(1)
        
      if (adminMatch && adminMatch.length > 0) {
        return NextResponse.json({ error: 'Ce pseudo appartient déjà à un administrateur.' }, { status: 403 })
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
    const { data: ban } = await supabaseServer.from('chat_bans').select('*').eq('ip_address', ip).limit(1)
    if (ban && ban.length > 0) {
      return NextResponse.json({ error: `Vous êtes banni du chat. Raison : ${(ban[0] as any).reason || 'Aucune'}` }, { status: 403 })
    }

    // 3. Insert message securely via backend
    const { data, error } = await supabaseServer.from('chat_messages').insert({
      username,
      avatar_url: avatar_url || null,
      content,
      ip_address: ip,
      name_color: name_color || null
    } as any).select().single()

    if (error) {
      console.error('Supabase Insert Error:', error)
      return NextResponse.json({ error: error.message || 'Erreur BDD' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: data })
  } catch (error: any) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: error.message || 'Erreur interne lors de l\'envoi' }, { status: 500 })
  }
}