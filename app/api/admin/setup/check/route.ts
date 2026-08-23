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
      let errorMessage = error.message
      // Supabase JS sometimes returns an empty message object {"message":""} for 401 Unauthorized API keys
      if (!errorMessage || errorMessage.trim() === '') {
        if (JSON.stringify(error) === '{"message":""}') {
          errorMessage = "La clé SUPABASE_SERVICE_ROLE_KEY est invalide ou non reconnue par Supabase (Erreur 401). Vérifiez que vous avez bien copié la clé 'service_role' (qui commence par eyJ...) et non 'sb_secret_...'."
        } else {
          errorMessage = JSON.stringify(error)
        }
      }
      
      return NextResponse.json({ error: 'Database error', details: errorMessage, hint: error.hint }, { status: 500 })
    }

    return NextResponse.json({ needsSetup: count === 0 })
  } catch (error) {
    console.error('Unexpected error checking admin setup:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
