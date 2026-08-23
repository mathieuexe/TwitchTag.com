import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET() {
  try {
    // Get total pseudos
    const { count: totalPseudos, error: pseudoError } = await supabaseServer
      .from('generated_pseudos')
      .select('*', { count: 'exact', head: true })

    if (pseudoError) throw pseudoError

    // Get monthly pseudos
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: monthlyPseudos, error: monthlyError } = await supabaseServer
      .from('generated_pseudos')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    if (monthlyError) throw monthlyError

    // Get total visits
    const { count: totalVisits, error: visitsError } = await supabaseServer
      .from('site_visits')
      .select('*', { count: 'exact', head: true })

    if (visitsError) throw visitsError

    // Get monthly visits
    const { count: monthlyVisits, error: monthlyVisitsError } = await supabaseServer
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
