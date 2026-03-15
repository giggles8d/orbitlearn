// Kroger client credentials OAuth + API helpers

let clientToken: { accessToken: string; expiresAt: number } | null = null

export async function getClientCredentialsToken(): Promise<string> {
  if (clientToken && Date.now() < clientToken.expiresAt) {
    return clientToken.accessToken
  }

  const clientId = process.env.KROGER_CLIENT_ID!
  const clientSecret = process.env.KROGER_CLIENT_SECRET!
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch('https://api.kroger.com/v1/connect/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials&scope=product.compact',
  })

  if (!res.ok) {
    throw new Error(`Kroger auth failed: ${res.status}`)
  }

  const data = await res.json()
  clientToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }

  return clientToken.accessToken
}

export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
}> {
  const clientId = process.env.KROGER_CLIENT_ID!
  const clientSecret = process.env.KROGER_CLIENT_SECRET!
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.dinnerdrop.app'}/auth/kroger/callback`

  const res = await fetch('https://api.kroger.com/v1/connect/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }).toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Kroger token exchange failed: ${res.status} ${text}`)
  }

  return res.json()
}

export async function searchProduct(
  query: string,
  accessToken: string
): Promise<{ productId: string; name: string } | null> {
  const res = await fetch(
    `https://api.kroger.com/v1/products?filter.term=${encodeURIComponent(query)}&filter.limit=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    }
  )

  if (!res.ok) return null

  const data = await res.json()
  const product = data.data?.[0]

  if (!product) return null

  return {
    productId: product.productId,
    name: product.description,
  }
}

export async function addItemsToCart(
  items: { productId: string; quantity: number }[],
  accessToken: string
): Promise<boolean> {
  const res = await fetch('https://api.kroger.com/v1/cart/add', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    body: JSON.stringify({
      items: items.map((item) => ({
        upc: item.productId,
        quantity: item.quantity,
      })),
    }),
  })

  return res.ok
}
