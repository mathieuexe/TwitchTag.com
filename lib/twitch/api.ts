const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || '4ieomv4l32flcgfndgjbroaxxmrb5m'
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || ''

interface TwitchTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

interface TwitchUserResponse {
  data: Array<{
    id: string
    login: string
    display_name: string
    type: string
    broadcaster_type: string
    description: string
    profile_image_url: string
    offline_image_url: string
    view_count: number
    created_at: string
  }>
}

let cachedToken: { token: string; expiresAt: number } | null = null

async function getTwitchAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  try {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`)
    }

    const data: TwitchTokenResponse = await response.json()

    // Cache token with 5 minute buffer before expiry
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 300) * 1000,
    }

    return data.access_token
  } catch (error) {
    console.error('Error getting Twitch access token:', error)
    throw error
  }
}

export async function checkUsernameAvailability(username: string): Promise<{
  available: boolean
  username: string
  error?: string
}> {
  try {
    // Validate username format first
    if (!username || username.length < 4 || username.length > 25) {
      return {
        available: false,
        username,
        error: 'Le pseudo doit contenir entre 4 et 25 caractères',
      }
    }

    const validPattern = /^[a-zA-Z0-9_]+$/
    if (!validPattern.test(username)) {
      return {
        available: false,
        username,
        error: 'Le pseudo ne peut contenir que des lettres, chiffres et underscores',
      }
    }

    const accessToken = await getTwitchAccessToken()

    const response = await fetch(
      `https://api.twitch.tv/helix/users?login=${encodeURIComponent(username.toLowerCase())}`,
      {
        headers: {
          'Client-ID': TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      if (response.status === 429) {
        return {
          available: false,
          username,
          error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
        }
      }
      throw new Error(`Twitch API error: ${response.statusText}`)
    }

    const data: TwitchUserResponse = await response.json()

    // If no data, username is available
    return {
      available: data.data.length === 0,
      username,
    }
  } catch (error) {
    console.error('Error checking username:', error)
    return {
      available: false,
      username,
      error: 'Une erreur est survenue lors de la vérification. Veuillez réessayer.',
    }
  }
}

export async function batchCheckUsernames(usernames: string[]): Promise<
  Array<{ available: boolean; username: string; error?: string }>
> {
  const results = await Promise.all(
    usernames.map((username) => checkUsernameAvailability(username))
  )
  return results
}
