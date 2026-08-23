import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get start of month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Get all stats in parallel
    const [
      { count: totalPseudos },
      { count: monthlyPseudos },
      { count: totalCopied },
      { count: monthlyCopied },
      { count: totalVisits },
      { count: monthlyVisits },
      donationsResult,
      monthlyDonationsResult,
    ] = await Promise.all([
      supabaseServer.from('generated_pseudos').select('*', { count: 'exact', head: true }),
      supabaseServer
        .from('generated_pseudos')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString()),
      supabaseServer.from('copied_pseudos').select('*', { count: 'exact', head: true }),
      supabaseServer
        .from('copied_pseudos')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString()),
      supabaseServer.from('site_visits').select('*', { count: 'exact', head: true }),
      supabaseServer
        .from('site_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString()),
      supabaseServer
        .from('donations')
        .select('amount')
        .eq('status', 'completed'),
      supabaseServer
        .from('donations')
        .select('amount')
        .eq('status', 'completed')
        .gte('completed_at', startOfMonth.toISOString()),
    ])

    // Calculate donation totals
    const totalDonations = (donationsResult.data || []).reduce((sum: number, d: any) => sum + (d?.amount || 0), 0)
    const monthlyDonations = (monthlyDonationsResult.data || []).reduce((sum: number, d: any) => sum + (d?.amount || 0), 0)

    return NextResponse.json({
      totalPseudos: totalPseudos || 0,
      monthlyPseudos: monthlyPseudos || 0,
      totalCopied: totalCopied || 0,
      monthlyCopied: monthlyCopied || 0,
      totalVisits: totalVisits || 0,
      monthlyVisits: monthlyVisits || 0,
      totalDonations,
      monthlyDonations,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
