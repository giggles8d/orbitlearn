import type { GroceryItem } from '@/types'

interface InstacartPayload {
  title: string
  image_url: string
  link_type: string
  items: {
    name: string
    quantity: number
    unit: string | null
    display_text: string
  }[]
}

export async function createInstacartLink(items: GroceryItem[]): Promise<{ link: string; fallback: boolean }> {
  const payload: InstacartPayload = {
    title: 'DinnerDrop Weekly Groceries',
    image_url: 'https://dinnerdrop.app/og-image.png',
    link_type: 'shopping_list',
    items: items.map((item) => ({
      name: item.searchTerm || item.name,
      quantity: parseFloat(item.quantity) || 1,
      unit: item.unit || null,
      display_text: `${item.quantity} ${item.unit} ${item.name}`.trim(),
    })),
  }

  const response = await fetch('https://connect.instacart.com/v2/products/products_link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.INSTACART_API_KEY}`,
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const firstItem = items[0]?.searchTerm || 'groceries'
    return {
      link: `https://www.instacart.com/store/search_v3/term?term=${encodeURIComponent(firstItem)}`,
      fallback: true,
    }
  }

  const data = await response.json()
  return { link: data.products_link_url, fallback: false }
}
