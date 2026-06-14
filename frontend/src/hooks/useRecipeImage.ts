import { useEffect, useState } from 'react'

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined
const cache = new Map<string, string | null>()

export function resolveImageQuery(
  imageQuery: string | undefined,
  recipeName: string,
  ingredientesUsados?: string[],
): string {
  const trimmed = imageQuery?.trim()
  if (trimmed) return trimmed

  if (ingredientesUsados?.length) {
    return ingredientesUsados.slice(0, 2).join(' ')
  }

  return recipeName.split(/\s+/).slice(0, 3).join(' ')
}

async function fetchFromUnsplash(query: string): Promise<string | null> {
  if (!UNSPLASH_KEY) return null

  const cached = cache.get(query)
  if (cached !== undefined) return cached

  try {
    const params = new URLSearchParams({
      query: `${query} food`,
      per_page: '3',
      orientation: 'landscape',
    })
    const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
    })
    if (!res.ok) {
      cache.set(query, null)
      return null
    }
    const data = await res.json()
    const url: string | undefined = data.results?.[0]?.urls?.regular
    cache.set(query, url ?? null)
    return url ?? null
  } catch {
    cache.set(query, null)
    return null
  }
}

export function useRecipeImage(
  imageQuery: string | undefined,
  recipeName: string,
  ingredientesUsados?: string[],
) {
  const query = resolveImageQuery(imageQuery, recipeName, ingredientesUsados)
  const [imageUrl, setImageUrl] = useState<string | null>(() => cache.get(query) ?? null)
  const [isLoading, setIsLoading] = useState(!cache.has(query))

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (cache.has(query)) {
        setImageUrl(cache.get(query) ?? null)
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      const url = await fetchFromUnsplash(query)
      if (!cancelled) {
        setImageUrl(url)
        setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [query])

  return { imageUrl, isLoading, hasUnsplashKey: Boolean(UNSPLASH_KEY) }
}
