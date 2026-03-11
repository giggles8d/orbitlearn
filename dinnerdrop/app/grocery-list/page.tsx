'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import GroceryList from '@/components/GroceryList'
import InstacartButton from '@/components/InstacartButton'
import type { GroceryCategory, GroceryItem, Meal } from '@/types'

type GroceryListData = Record<GroceryCategory, GroceryItem[]>

export default function GroceryListPage() {
  const [groceryList, setGroceryList] = useState<GroceryListData | null>(null)
  const [totalCost, setTotalCost] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadGroceryList = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: plan } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!plan) {
      setLoading(false)
      return
    }

    setTotalCost(plan.total_estimated_cost || 0)

    if (plan.grocery_list && Object.keys(plan.grocery_list).length > 0) {
      setGroceryList(plan.grocery_list as GroceryListData)
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/generate-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meals: plan.meals as Meal[] }),
      })

      const data = await res.json()
      setGroceryList(data)

      await supabase
        .from('meal_plans')
        .update({ grocery_list: data })
        .eq('id', plan.id)
    } catch (error) {
      console.error('Error generating grocery list:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadGroceryList()
  }, [loadGroceryList])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Building your grocery list...</p>
        </div>
      </div>
    )
  }

  if (!groceryList) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-foreground font-medium">No meal plan found</p>
          <p className="text-muted-foreground">Generate a meal plan first from your dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Your grocery list
          </h1>
          <p className="text-muted-foreground mt-1">
            Everything you need for this week&apos;s dinners
          </p>
        </div>

        <GroceryList groceryList={groceryList} />

        <div className="mt-8 p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Estimated total</span>
            <span className="text-lg font-semibold text-foreground">
              ${totalCost.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border sm:static sm:mt-6 sm:p-0 sm:bg-transparent sm:border-0">
          <InstacartButton groceryList={groceryList} />
        </div>

        <div className="h-20 sm:hidden" />
      </div>
    </div>
  )
}
