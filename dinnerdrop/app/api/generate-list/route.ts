import { generateWithClaude, parseClaudeJSON } from '@/lib/claude'
import type { GroceryCategory, GroceryItem } from '@/types'

type GroceryListResponse = Record<GroceryCategory, GroceryItem[]>

export async function POST(request: Request) {
  try {
    const { meals } = await request.json()

    const allIngredients = meals.flatMap((meal: { ingredients: unknown[] }) => meal.ingredients)

    const prompt = `You are a grocery list optimizer. Take this list of ingredients from 5 dinner recipes and:
1. Combine duplicates (e.g., 3 recipes need chicken → one line item with total quantity)
2. Normalize units (convert all to the same unit type where possible)
3. Organize by store section
4. Create a clean, shopper-friendly search term for each item

Ingredients:
${JSON.stringify(allIngredients, null, 2)}

Return ONLY valid JSON, no markdown:
{
  "Produce": [{ "name": "string", "quantity": "string", "unit": "string", "category": "Produce", "searchTerm": "string" }],
  "Meat & Seafood": [],
  "Dairy & Eggs": [],
  "Pantry & Dry Goods": [],
  "Frozen": []
}`

    const text = await generateWithClaude(prompt, 2000)
    const groceryList = parseClaudeJSON<GroceryListResponse>(text)

    return Response.json(groceryList)
  } catch (error) {
    console.error('Error generating grocery list:', error)
    return Response.json(
      { error: 'Failed to generate grocery list. Please try again.' },
      { status: 500 }
    )
  }
}
