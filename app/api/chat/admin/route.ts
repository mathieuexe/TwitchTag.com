import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  // Verify Admin Session
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { action, payload } = await req.json()

    if (action === 'delete_message') {
      // @ts-ignore
      const { error } = await supabaseServer.from('chat_messages').update({ 
        is_deleted: true, 
        content: '[Message supprimé par un modérateur]' 
      }).eq('id', payload.id)
      if (error) throw error
    } 
    
    else if (action === 'clear_chat') {
      // Supabase trick to delete all rows
      const { error } = await supabaseServer.from('chat_messages').delete().neq('username', 'impossible_username_12345')
      if (error) throw error
    } 
    
    else if (action === 'toggle_chat') {
      const updateData: any = { is_disabled: payload.is_disabled }
      // @ts-ignore
      const { error } = await supabaseServer.from('chat_settings').update(updateData).eq('id', 1)
      if (error) throw error
    } 
    
    else if (action === 'pin_message') {
      const updateData: any = { pinned_message: payload.message || null }
      // @ts-ignore
      const { error } = await supabaseServer.from('chat_settings').update(updateData).eq('id', 1)
      if (error) throw error
    } 
    
    else if (action === 'ban_user') {
      // Get the IP from the message
      const { data: msg } = await supabaseServer.from('chat_messages').select('ip_address, username').eq('id', payload.message_id).single()
      
      if (msg && (msg as any).ip_address) {
        // 1. Insert Ban
        await supabaseServer.from('chat_bans').insert({
          ip_address: (msg as any).ip_address,
          username: (msg as any).username,
          reason: payload.reason || 'Banni par un modérateur'
        } as any)
        
        // 2. Delete all messages from this IP
        await supabaseServer.from('chat_messages').delete().eq('ip_address', (msg as any).ip_address)
      } else {
        return NextResponse.json({ error: 'Message introuvable ou IP manquante' }, { status: 404 })
      }
    }

    else if (action === 'create_poll') {
      const { question, options, pin_poll, username, avatar_url, name_color } = payload
      
      const pollData = {
        question,
        options: options.map((opt: string) => ({ text: opt, votes: 0 })),
        voted_ips: []
      }

      // @ts-ignore
      const { data, error } = await supabaseServer.from('chat_messages').insert({
        username: username || 'Admin',
        avatar_url: avatar_url || null,
        content: `Sondage : ${question}`,
        name_color: name_color || '#9146FF',
        is_poll: true,
        poll_data: pollData
      } as any).select().single()

      if (error) throw error

      if (pin_poll) {
        const updateData: any = { pinned_message: `Sondage : ${question}` }
        // @ts-ignore
        await supabaseServer.from('chat_settings').update(updateData).eq('id', 1)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin Chat Action Error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}