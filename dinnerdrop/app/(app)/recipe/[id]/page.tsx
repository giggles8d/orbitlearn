'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Heart, RefreshCw, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Meal } from '@/types'

export default function RecipePage() {
  const params = useParams()
  const id = params.id as string

  const [meal, setMeal] = useState<Meal | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [swapping, setSwapping] = useState(false)
  const supabase = createClient()

  const checkFavorite = useCallback(async (mealName: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('meal_name', mealName)
      .limit(1)

    setIsFavorite((data?.length ?? 0) > 0)
  }, [supabase])

  useEffect(() => {
    const stored = localStorage.getItem(`meal-${id}`)
    if (stored) {
      const parsed = JSON.parse(stored) as Meal
      setMeal(parsed)
      checkFavorite(parsed.name)
    }
  }, [id, checkFavorite])

  async function toggleFavorite() {
    if (!meal) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('meal_name', meal.name)
      setIsFavorite(false)
    } else {
      await supabase.from('favorites').insert({
        user_id: user.id,
        meal_name: meal.name,
        meal_data: meal,
      })
      setIsFavorite(true)
    }
  }

  async function handleSwap() {
    if (!meal) return
    setSwapping(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSwapping(false); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) { setSwapping(false); return }

    try {
      const res = await fetch('/api/swap-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentMeal: meal,
          profile: {
            familySize: profile.family_size,
            weeklyBudget: profile.weekly_budget,
            maxCookTime: profile.max_cook_time,
            cuisinePreference: profile.cuisine_preference,
            dietaryNeeds: profile.dietary_needs || [],
          },
        }),
      })

      const data = await res.json()

      if (data.meal) {
        const newMeal = data.meal as Meal
        // Update localStorage
        localStorage.setItem(`meal-${id}`, JSON.stringify(newMeal))

        // Update the meal plan in localStorage too
        const storedMeals = localStorage.getItem('current-meals')
        if (storedMeals) {
          const meals: Meal[] = JSON.parse(storedMeals)
          const updated = meals.map(m => m.day === meal.day ? newMeal : m)
          localStorage.setItem('current-meals', JSON.stringify(updated))
        }

        // Update the meal plan in Supabase
        const { data: plan } = await supabase
          .from('meal_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (plan) {
          const updatedMeals = (plan.meals as Meal[]).map(m =>
            m.day === meal.day ? newMeal : m
          )
          await supabase
            .from('meal_plans')
            .update({ meals: updatedMeals })
            .eq('id', plan.id)
        }

        setMeal(newMeal)
        checkFavorite(newMeal.name)
      }
    } catch (error) {
      console.error('Error swapping meal:', error)
    } finally {
      setSwapping(false)
    }
  }

  if (!meal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-foreground font-medium">Meal not found</p>
          <Link
            href="/dashboard"
            className="text-primary hover:underline text-sm"
          >
            Back to meal plan
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to meal plan
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
              {meal.day}
            </p>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              {meal.name}
            </h1>
          </div>
          <button
            onClick={toggleFavorite}
            className="p-2 rounded-full hover:bg-muted transition-colors flex-shrink-0"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                isFavorite
                  ? 'fill-red-500 text-red-500'
                  : 'text-muted-foreground hover:text-red-400'
              }`}
            />
          </button>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{meal.prepTime} min prep + {meal.cookTime} min cook</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{meal.servings} servings</span>
          </div>
          <div className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            ${meal.estimatedCost.toFixed(2)}
          </div>
        </div>

        {/* Ingredients */}
        <section className="mb-8">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
            Ingredients
          </h2>
          <ul className="space-y-2">
            {meal.ingredients.map((ing, i) => (
              <li
                key={i}
                className="flex items-baseline gap-2 text-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                <span className="text-foreground">
                  <span className="font-medium">{ing.quantity} {ing.unit}</span>{' '}
                  {ing.name}
                </span>
                <span className="text-muted-foreground text-xs ml-auto">
                  {ing.category}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Steps */}
        <section className="mb-8">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
            Instructions
          </h2>
          <ol className="space-y-4">
            {meal.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground leading-relaxed pt-0.5">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Swap button */}
        <div className="border-t border-border pt-6">
          <button
            onClick={handleSwap}
            disabled={swapping}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-md border border-input text-foreground font-medium hover:bg-muted disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${swapping ? 'animate-spin' : ''}`} />
            {swapping ? 'Finding a new meal...' : 'Swap this meal'}
          </button>
          <p className="text-xs text-muted-foreground mt-2">
            Replace this meal with a similar alternative.
          </p>
        </div>
      </div>
    </div>
  )
}
