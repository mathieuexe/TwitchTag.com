import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
})

export async function GET() {
  try {
    // Get total pseudos
    const { count: totalPseudos, error: pseudoError } = await supabase
      .from('generated_pseudos')
      .select('*', { count: 'exact', head: true })

    if (pseudoError) throw pseudoError

    // Get monthly pseudos
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: monthlyPseudos, error: monthlyError } = await supabase
      .from('generated_pseudos')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    if (monthlyError) throw monthlyError

    // Get total visits
    const { count: totalVisits, error: visitsError } = await supabase
      .from('site_visits')
      .select('*', { count: 'exact', head: true })

    if (visitsError) throw visitsError

    // Get monthly visits
    const { count: monthlyVisits, error: monthlyVisitsError } = await supabase
      .from('site_visits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    if (monthlyVisitsError) throw monthlyVisitsError

    return NextResponse.json({
      totalPseudos: totalPseudos || 0,
      totalVisits: totalVisits || 0,
      monthlyVisits: monthlyVisits || 0,
      monthlyPseudos: monthlyPseudos || 0,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
