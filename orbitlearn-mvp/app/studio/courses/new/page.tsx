'use client'

import { useState } from 'react'

export default function NewCoursePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError(null)
    const form = new FormData(e.currentTarget)
    const body = Object.fromEntries(form.entries())
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error(await res.text())
      const { slug } = await res.json()
      window.location.href = `/course/${slug}`
    } catch (err: any) {
      setError(err.message || 'Failed to create course')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Create a new course</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input name="title" placeholder="Title" className="w-full rounded bg-white/10 px-3 py-2" required />
        <input name="subtitle" placeholder="Subtitle" className="w-full rounded bg-white/10 px-3 py-2" />
        <textarea name="description" placeholder="Description" className="w-full rounded bg-white/10 px-3 py-2 min-h-[120px]" />
        <input name="category" placeholder="Category (e.g., AI, Engineering)" className="w-full rounded bg-white/10 px-3 py-2" />
        <div className="flex gap-3">
          <input name="price" placeholder="Price (in cents)" type="number" className="w-1/2 rounded bg-white/10 px-3 py-2" />
          <input name="currency" placeholder="Currency (e.g., USD)" defaultValue="USD" className="w-1/2 rounded bg-white/10 px-3 py-2" />
        </div>
        <button disabled={loading} className="rounded bg-brand text-white px-4 py-2">
          {loading ? 'Creating…' : 'Create'}
        </button>
        {error ? <p className="text-red-300 text-sm">{error}</p> : null}
      </form>
    </div>
  )
}
