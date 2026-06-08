import { useState, useEffect, useCallback } from 'react'
import type { RecetaCompartida } from '../types/recipe'
import { RecipeCard } from '../components/RecipeCard'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora mismo'
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  return `hace ${Math.floor(hours / 24)}d`
}

export function ComunidadPage() {
  const [entradas, setEntradas] = useState<RecetaCompartida[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/comunidad`)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setEntradas(data.recetas ?? [])
    } catch {
      setError('No se pudo cargar la comunidad. Verificá que el servidor esté corriendo.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <header className="flex items-start justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="font-display font-black text-4xl text-bark mb-1">Comunidad</h1>
          <p className="font-body text-muted text-sm">
            Recetas generadas y compartidas por otros usuarios
          </p>
        </div>
        <button
          onClick={cargar}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-bark/10 rounded-xl font-body text-sm text-muted hover:text-bark hover:border-gold/40 transition-all disabled:opacity-40"
        >
          <svg className={`w-4 h-4 ${isLoading ? 'animate-spin-slow' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </header>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-up">
          <div className="text-5xl animate-bounce-sm">🌐</div>
          <p className="font-body text-muted text-sm">Cargando recetas de la comunidad...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="px-4 py-3 bg-spice/5 border border-spice/20 rounded-xl font-body text-sm text-spice animate-fade-up">
          ⚠ {error}
        </div>
      )}

      {!isLoading && !error && entradas.length === 0 && (
        <div className="text-center py-20 animate-fade-up">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="font-display font-bold text-bark text-xl mb-2">Sin recetas aún</p>
          <p className="font-body text-muted text-sm max-w-xs mx-auto">
            Generá recetas y usá el botón de compartir para que aparezcan acá.
          </p>
        </div>
      )}

      {!isLoading && !error && entradas.length > 0 && (
        <div className="space-y-6">
          {entradas.map((entrada, i) => (
            <div key={`${entrada.receta.nombre}-${entrada.timestamp}`} className="space-y-1.5">
              <p className="font-body text-xs text-muted px-1">
                🕐 Compartida {timeAgo(entrada.timestamp)}
              </p>
              <RecipeCard receta={entrada.receta} index={i} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
