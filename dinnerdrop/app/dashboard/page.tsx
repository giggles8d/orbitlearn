'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import MealGrid from '@/components/MealGrid'
import type { Meal } from '@/types'

export default function DashboardPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [totalCost, setTotalCost] = useState(0)
  const [budget, setBudget] = useState('$100')
  const [loading, setLoading] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const loadExistingPlan = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      setBudget(profile.weekly_budget)

      if (!profile.onboarding_complete) {
        router.push('/onboarding')
        return
      }
    }

    const { data: plan } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (plan) {
      setMeals(plan.meals as Meal[])
      setTotalCost(plan.total_estimated_cost || 0)
      setHasGenerated(true)
    }
  }, [supabase, router])

  useEffect(() => {
    loadExistingPlan()
  }, [loadExistingPlan])

  async function generatePlan() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) return

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familySize: profile.family_size,
          weeklyBudget: profile.weekly_budget,
          maxCookTime: profile.max_cook_time,
          cuisinePreference: profile.cuisine_preference,
          dietaryNeeds: profile.dietary_needs || [],
        }),
      })

      const data = await res.json()

      if (data.meals) {
        setMeals(data.meals)
        setTotalCost(data.totalEstimatedCost)
        setHasGenerated(true)

        const today = new Date()
        const monday = new Date(today)
        monday.setDate(today.getDate() - today.getDay() + 1)

        await supabase.from('meal_plans').insert({
          user_id: user.id,
          week_start: monday.toISOString().split('T')[0],
          meals: data.meals,
          grocery_list: {},
          total_estimated_cost: data.totalEstimatedCost,
        })
      }
    } catch (error) {
      console.error('Error generating plan:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              This week&apos;s dinners
            </h1>
            <p className="text-muted-foreground mt-1">
              5 meals planned around your budget and preferences
            </p>
          </div>
          <button
            onClick={generatePlan}
            disabled={loading}
            className="px-5 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Generating...' : hasGenerated ? 'Generate new week' : 'Generate my plan'}
          </button>
        </div>

        <MealGrid meals={meals} loading={loading} />

        {hasGenerated && meals.length > 0 && (
          <>
            <div className="mt-8 p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  Estimated total
                </span>
                <span className="text-sm text-muted-foreground">
                  Budget: {budget}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (totalCost / parseFloat(budget.replace('$', '').replace('+', ''))) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-lg font-semibold text-foreground">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/grocery-list"
                className="inline-block px-8 py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Build my grocery list &rarr;
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
