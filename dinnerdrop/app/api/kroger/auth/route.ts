import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.KROGER_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'Kroger not configured' }, { status: 500 })
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.dinnerdrop.app'}/auth/kroger/callback`

  const authUrl = new URL('https://api.kroger.com/v1/connect/oauth2/authorize')
  authUrl.searchParams.set('scope', 'cart.basic:write product.compact')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)

  return NextResponse.redirect(authUrl.toString())
}
