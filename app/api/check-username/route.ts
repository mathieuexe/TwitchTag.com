import { NextRequest, NextResponse } from 'next/server'
import { checkUsernameAvailability } from '@/lib/twitch/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    const result = await checkUsernameAvailability(username)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error checking username:', error)
    return NextResponse.json(
      { error: 'Failed to check username availability' },
      { status: 500 }
    )
  }
}
