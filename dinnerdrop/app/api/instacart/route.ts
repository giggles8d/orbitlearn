import { createInstacartLink } from '@/lib/instacart'
import type { GroceryItem } from '@/types'

export async function POST(request: Request) {
  try {
    const { groceryList } = await request.json()

    const allItems = Object.values(groceryList).flat() as GroceryItem[]
    const result = await createInstacartLink(allItems)

    return Response.json(result)
  } catch (error) {
    console.error('Error creating Instacart link:', error)
    return Response.json(
      { error: 'Failed to create Instacart link.' },
      { status: 500 }
    )
  }
}
