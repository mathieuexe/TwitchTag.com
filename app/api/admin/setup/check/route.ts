import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { count, error } = await supabaseServer
      .from('admin_users')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Error checking admin setup:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ needsSetup: count === 0 })
  } catch (error) {
    console.error('Unexpected error checking admin setup:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
