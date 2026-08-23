import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { page_url } = await req.json()
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    
    // Check if this IP already visited today
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    
    const { data: existingVisit } = await supabaseServer
      .from('site_visits')
      .select('id')
      .eq('session_id', ip) // we use session_id to store IP securely for stats
      .gte('created_at', startOfDay.toISOString())
      .limit(1)
      .maybeSingle()
      
    if (existingVisit) {
      return NextResponse.json({ success: true, tracked: false })
    }

    // Insert new visit
    await supabaseServer.from('site_visits').insert({
      page_url: page_url || '/',
      session_id: ip,
    } as any)

    return NextResponse.json({ success: true, tracked: true })
  } catch (error) {
    console.error('Error tracking visit:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
