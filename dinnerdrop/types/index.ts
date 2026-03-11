export interface UserProfile {
  id: string
  familySize: number
  weeklyBudget: string
  maxCookTime: number
  cuisinePreference: string
  dietaryNeeds: string[]
  preferredStore: string
  onboardingComplete: boolean
  subscriptionStatus: 'free' | 'trialing' | 'active' | 'canceled'
}

export interface Meal {
  day: string           // Monday–Friday
  name: string
  cookTime: number      // minutes
  servings: number
  estimatedCost: number
  ingredients: Ingredient[]
  steps: string[]
  prepTime: number
}

export interface Ingredient {
  name: string
  quantity: string
  unit: string
  category: GroceryCategory
}

export type GroceryCategory =
  | 'Produce'
  | 'Meat & Seafood'
  | 'Dairy & Eggs'
  | 'Pantry & Dry Goods'
  | 'Frozen'
  | 'Bakery'
  | 'Beverages'

export interface GroceryItem {
  name: string
  quantity: string
  unit: string
  category: GroceryCategory
  searchTerm: string    // normalized term for Instacart API lookup
}

export interface MealPlan {
  id: string
  userId: string
  weekStart: string
  meals: Meal[]
  groceryList: Record<GroceryCategory, GroceryItem[]>
  totalEstimatedCost: number
  instacartLink?: string
}
