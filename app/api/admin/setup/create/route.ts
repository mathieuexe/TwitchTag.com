import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // 1. Check if an admin already exists (security measure)
    const { count, error: countError } = await supabaseServer
      .from('admin_users')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error checking admin count:', countError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (count && count > 0) {
      return NextResponse.json({ error: 'An admin already exists' }, { status: 403 })
    }

    // 2. Parse request body
    const body = await request.json()
    const { email, name, password } = body

    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    // 4. Create admin user
    const { error: insertError } = await supabaseServer
      .from('admin_users')
      .insert([
        {
          email,
          name,
          password_hash,
          is_super_admin: true, // First user is always super admin
        }
      ] as any)

    if (insertError) {
      console.error('Error creating admin:', insertError)
      return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error creating admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
