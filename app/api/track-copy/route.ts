import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
})

export async function POST(request: NextRequest) {
  try {
    const { pseudo } = await request.json()

    if (!pseudo) {
      return NextResponse.json({ error: 'Pseudo required' }, { status: 400 })
    }

    // Try to find the generated pseudo id
    const { data: generatedPseudo } = await (supabase
      .from('generated_pseudos') as any)
      .select('id')
      .eq('pseudo', pseudo)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const { error } = await supabase.from('copied_pseudos').insert({
      pseudo,
      generated_pseudo_id: generatedPseudo?.id || null,
    } as any)

    if (error) {
      console.error('Error tracking copy:', error)
      return NextResponse.json({ error: 'Failed to track copy' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in track-copy route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}