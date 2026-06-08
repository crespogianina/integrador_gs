import { useState } from 'react'
import type { Filtros, Receta } from '../types/recipe'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function useRecipeGenerator() {
  const [recetas, setRecetas] = useState<Receta[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generarRecetas = async (ingredientes: string[], filtros: Filtros) => {
    setIsLoading(true)
    setError(null)
    setRecetas([])

    try {
      const response = await fetch(`${API_URL}/api/recetas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredientes, filtros }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail ?? `Error ${response.status}`)
      }

      const data = await response.json()
      setRecetas(data.recetas ?? [])
    } catch (err: any) {
      setError(err.message ?? 'Error al conectar con el servidor.')
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
