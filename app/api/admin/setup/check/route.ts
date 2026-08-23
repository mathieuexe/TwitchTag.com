import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Database error', details: 'Missing Supabase environment variables' }, { status: 500 })
    }

    const { count, error } = await supabaseServer
      .from('admin_users')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Error checking admin setup:', error)
      return NextResponse.json({ error: 'Database error', details: error.message || JSON.stringify(error), hint: error.hint }, { status: 500 })
    }

    return NextResponse.json({ needsSetup: count === 0 })
  } catch (error) {
    console.error('Unexpected error checking admin setup:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
