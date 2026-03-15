import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { exchangeCodeForTokens } from '@/lib/kroger'

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 })
    }

    const tokens = await exchangeCodeForTokens(code)

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    await supabase
      .from('profiles')
      .update({
        kroger_access_token: tokens.access_token,
        kroger_refresh_token: tokens.refresh_token,
        kroger_token_expires_at: expiresAt,
        preferred_store: 'kroger',
      })
      .eq('id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Kroger token exchange error:', error)
    return NextResponse.json(
      { error: 'Failed to connect Kroger account' },
      { status: 500 }
    )
  }
}
