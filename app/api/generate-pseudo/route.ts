import { NextRequest, NextResponse } from 'next/server'
import { generatePseudos } from '@/lib/utils/pseudo-generator'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keywords, includeNumbers, includeSpecialChars, easyToRemember, length, count } = body

    // Generate pseudos
    const pseudos = generatePseudos({
      keywords: keywords || [],
      includeNumbers: includeNumbers ?? true,
      includeSpecialChars: includeSpecialChars ?? false,
      easyToRemember: easyToRemember ?? true,
      length: length || 12,
      count: count || 10,
    })

    // Store generated pseudos in database
    const inserts = pseudos.map((pseudo: string) => ({
      pseudo,
      keywords: keywords || [],
      has_numbers: includeNumbers || false,
      has_special_chars: includeSpecialChars || false,
      easy_to_remember: easyToRemember || true,
    }))

    const { error } = await supabaseServer.from('generated_pseudos').insert(inserts as any)

    if (error) {
      console.error('Error storing generated pseudos:', error)
      // Continue even if storage fails
    }

    return NextResponse.json({ pseudos })
  } catch (error) {
    console.error('Error generating pseudos:', error)
    return NextResponse.json(
      { error: 'Failed to generate pseudos' },
      { status: 500 }
    )
  }
}
