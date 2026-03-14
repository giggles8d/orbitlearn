import { generateWithClaude, parseClaudeJSON } from '@/lib/claude'
import type { Meal } from '@/types'

interface SwapMealResponse {
  meal: Meal
}

export async function POST(request: Request) {
  try {
    const { currentMeal, profile } = await request.json()

    const prompt = `You are a meal planning assistant for DinnerDrop. The user wants to swap out a meal from their weekly plan.

Current meal being replaced:
- Name: ${currentMeal.name}
- Day: ${currentMeal.day}

User profile:
- Family size: ${profile.familySize} people
- Weekly grocery budget: ${profile.weeklyBudget}
- Max cook time per dinner: ${profile.maxCookTime} minutes
- Cuisine preference: ${profile.cuisinePreference}
- Dietary needs: ${profile.dietaryNeeds?.length > 0 ? profile.dietaryNeeds.join(', ') : 'none'}

Requirements:
- Generate exactly 1 replacement meal for ${currentMeal.day}
- It must be different from "${currentMeal.name}"
- Similar style/cuisine but a fresh option
- Must be completable in ${profile.maxCookTime} minutes or less
- Estimated cost should be around $${currentMeal.estimatedCost}
- Maximum 8 ingredients
- Prioritize meals a tired parent can actually cook on a weeknight

Return ONLY valid JSON with this exact structure, no markdown:
{
  "meal": {
    "day": "${currentMeal.day}",
    "name": "string",
    "cookTime": 25,
    "prepTime": 10,
    "servings": ${profile.familySize},
    "estimatedCost": 18.50,
    "ingredients": [
      { "name": "string", "quantity": "1.5", "unit": "lbs", "category": "Meat & Seafood", "searchTerm": "chicken breast" }
    ],
    "steps": ["Step 1", "Step 2", "Step 3"]
  }
}`

    const text = await generateWithClaude(prompt, 2000)
    const data = parseClaudeJSON<SwapMealResponse>(text)

    return Response.json(data)
  } catch (error) {
    console.error('Error swapping meal:', error)
    return Response.json(
      { error: 'Failed to swap meal. Please try again.' },
      { status: 500 }
    )
  }
}
