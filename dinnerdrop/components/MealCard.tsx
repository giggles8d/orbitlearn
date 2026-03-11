import type { Meal } from '@/types'

interface MealCardProps {
  meal: Meal
}

export default function MealCard({ meal }: MealCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-3 hover:shadow-md transition-shadow">
      <p className="text-xs font-medium text-primary uppercase tracking-wide">
        {meal.day}
      </p>
      <h3 className="text-lg font-heading font-semibold text-card-foreground leading-tight">
        {meal.name}
      </h3>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>{meal.cookTime} min</span>
        <span>&middot;</span>
        <span>{meal.servings} servings</span>
      </div>
      <div className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
        ${meal.estimatedCost.toFixed(2)}
      </div>
    </div>
  )
}
