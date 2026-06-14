import { useCallback, useState } from 'react'
import { apiFetch, parseApiError } from '../lib/api'
import type { Receta } from '../types/recipe'

export interface FavoriteItem {
  id: string
  receta: Receta
}

interface RecipeRead {
  id: string
  user_id: string
  title: string
  content: Receta
}

function toFavoriteItem(recipe: RecipeRead): FavoriteItem {
  return { id: recipe.id, receta: recipe.content }
}

export function useFavorites() {
  const [favoritos, setFavoritos] = useState<FavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadFavoritos = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiFetch('/recipes')
      if (!response.ok) throw new Error(await parseApiError(response))
      const data: RecipeRead[] = await response.json()
      setFavoritos(data.map(toFavoriteItem))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar favoritos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveFavorite = useCallback(async (receta: Receta) => {
    const response = await apiFetch('/recipes', {
      method: 'POST',
      body: JSON.stringify({ title: receta.nombre, content: receta }),
    })
    if (!response.ok) throw new Error(await parseApiError(response))
    const saved: RecipeRead = await response.json()
    const item = toFavoriteItem(saved)
    setFavoritos((prev) => {
      if (prev.some((f) => f.id === item.id || f.receta.nombre === item.receta.nombre)) return prev
      return [...prev, item]
    })
    return item
  }, [])

  const deleteFavorite = useCallback(async (id: string) => {
    const response = await apiFetch(`/recipes/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error(await parseApiError(response))
    setFavoritos((prev) => prev.filter((f) => f.id !== id))
  }, [])

  return { favoritos, isLoading, error, loadFavoritos, saveFavorite, deleteFavorite }
}
