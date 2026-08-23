import { supabaseClient } from '@/lib/supabase/client'

export interface SiteStats {
  totalPseudos: number
  totalVisits: number
  monthlyVisits: number
  monthlyPseudos: number
}

export async function getSiteStats(): Promise<SiteStats> {
  try {
    // Get total pseudos
    const { count: totalPseudos, error: pseudoError } = await supabaseClient
      .from('generated_pseudos')
      .select('*', { count: 'exact', head: true })

    if (pseudoError) throw pseudoError

    // Get monthly pseudos
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: monthlyPseudos, error: monthlyError } = await supabaseClient
      .from('generated_pseudos')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    if (monthlyError) throw monthlyError

    // Get total visits
    const { count: totalVisits, error: visitsError } = await supabaseClient
      .from('site_visits')
      .select('*', { count: 'exact', head: true })

    if (visitsError) throw visitsError

    // Get monthly visits
    const { count: monthlyVisits, error: monthlyVisitsError } = await supabaseClient
      .from('site_visits')
      .select('*', { count: 'exact', head: true })
      .gte('visit_date', startOfMonth.toISOString().split('T')[0])

    if (monthlyVisitsError) throw monthlyVisitsError

    return {
      totalPseudos: totalPseudos || 0,
      totalVisits: totalVisits || 0,
      monthlyVisits: monthlyVisits || 0,
      monthlyPseudos: monthlyPseudos || 0,
    }
  } catch (error) {
    console.error('Error fetching site stats:', error)
    return {
      totalPseudos: 0,
      totalVisits: 0,
      monthlyVisits: 0,
      monthlyPseudos: 0,
    }
  }
}

export async function trackVisit(pagePath: string) {
  try {
    await supabaseClient.from('site_visits').insert({
      page_path: pagePath,
      visit_date: new Date().toISOString().split('T')[0],
    })
  } catch (error) {
    console.error('Error tracking visit:', error)
  }
}

export async function incrementPseudoCount() {
  try {
    const { data } = await supabaseClient
      .from('site_settings')
      .select('value')
      .eq('key', 'total_pseudos')
      .single()

    const currentCount = data?.value?.count || 0

    await supabaseClient
      .from('site_settings')
      .upsert({
        key: 'total_pseudos',
        value: { count: currentCount + 1 },
      })
  } catch (error) {
    console.error('Error incrementing pseudo count:', error)
  }
}
