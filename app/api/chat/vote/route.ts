import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { message_id, option_index } = await req.json()
    
    // Get client IP
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown'

    // Get the poll message
    const { data: msg, error: fetchError } = await supabaseServer
      .from('chat_messages')
      .select('id, is_poll, poll_data')
      .eq('id', message_id)
      .single()

    if (fetchError || !msg) {
      return NextResponse.json({ error: 'Sondage introuvable' }, { status: 404 })
    }

    if (!(msg as any).is_poll || !(msg as any).poll_data) {
      return NextResponse.json({ error: 'Ce message n\'est pas un sondage' }, { status: 400 })
    }

    const pollData = (msg as any).poll_data as any

    // Check if IP already voted
    if (pollData.voted_ips && pollData.voted_ips.includes(ip)) {
      return NextResponse.json({ error: 'Vous avez déjà voté pour ce sondage' }, { status: 400 })
    }

    // Validate option_index
    if (option_index < 0 || option_index >= pollData.options.length) {
      return NextResponse.json({ error: 'Option invalide' }, { status: 400 })
    }

    // Register vote
    pollData.options[option_index].votes += 1
    if (!pollData.voted_ips) pollData.voted_ips = []
    pollData.voted_ips.push(ip)

    // Update message
    const supabaseAny = supabaseServer as any
    const { error: updateError } = await supabaseAny
      .from('chat_messages')
      .update({ poll_data: pollData })
      .eq('id', message_id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Vote Error:', error)
    return NextResponse.json({ error: 'Erreur interne lors du vote' }, { status: 500 })
  }
}
