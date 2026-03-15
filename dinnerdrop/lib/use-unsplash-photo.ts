'use client'

import { useEffect, useState } from 'react'

interface UnsplashPhoto {
  url: string
  blurUrl?: string
  alt: string
  credit: { name: string; link: string }
}

const cache = new Map<string, UnsplashPhoto | null>()

export function useUnsplashPhoto(query: string): {
  photo: UnsplashPhoto | null
  loading: boolean
} {
  const [photo, setPhoto] = useState<UnsplashPhoto | null>(
    cache.get(query) ?? null
  )
  const [loading, setLoading] = useState(!cache.has(query))

  useEffect(() => {
    if (cache.has(query)) {
      setPhoto(cache.get(query) ?? null)
      setLoading(false)
      return
    }

    const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
    if (!key) {
      cache.set(query, null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchPhoto() {
      try {
        const searchQuery = `${query} dinner food`
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape&client_id=${key}`
        )

        if (!res.ok) {
          cache.set(query, null)
          if (!cancelled) setLoading(false)
          return
        }

        const data = await res.json()
        const result = data.results?.[0]

        if (!result) {
          cache.set(query, null)
          if (!cancelled) setLoading(false)
          return
        }

        const photoData: UnsplashPhoto = {
          url: result.urls.regular,
          blurUrl: result.blur_hash,
          alt: result.alt_description || `Photo of ${query}`,
          credit: {
            name: result.user.name,
            link: result.user.links.html,
          },
        }

        cache.set(query, photoData)
        if (!cancelled) {
          setPhoto(photoData)
          setLoading(false)
        }
      } catch {
        cache.set(query, null)
        if (!cancelled) setLoading(false)
      }
    }

    fetchPhoto()
    return () => { cancelled = true }
  }, [query])

  return { photo, loading }
}
