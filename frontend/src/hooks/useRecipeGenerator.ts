import { useState } from 'react'
import { apiFetch, parseApiError } from '../lib/api'
import type { Filtros, Receta } from '../types/recipe'

export function useRecipeGenerator() {
  const [recetas, setRecetas] = useState<Receta[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generarRecetas = async (ingredientes: string[], filtros: Filtros) => {
    setIsLoading(true)
    setError(null)
    setRecetas([])

    try {
      const response = await apiFetch('/api/recetas', {
        method: 'POST',
        body: JSON.stringify({ ingredientes, filtros }),
      })

      if (!response.ok) {
        throw new Error(await parseApiError(response))
      }

      const data = await response.json()
      setRecetas(data.recetas ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con el servidor.')
    } finally {
      setIsLoading(false)
    }
  }

  const limpiar = () => {
    setRecetas([])
    setError(null)
  }

  return { recetas, isLoading, error, generarRecetas, limpiar }
}
