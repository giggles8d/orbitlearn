import { NextRequest, NextResponse } from 'next/server'
import { getClientCredentialsToken, searchProduct } from '@/lib/kroger'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 })
    }

    const token = await getClientCredentialsToken()
    const result = await searchProduct(query, token)

    if (!result) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Kroger search error:', error)
    return NextResponse.json(
      { error: 'Failed to search Kroger products' },
      { status: 500 }
    )
  }
}
