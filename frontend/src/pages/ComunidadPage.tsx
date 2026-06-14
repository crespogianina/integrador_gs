import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Clock, Globe, RefreshCw, UtensilsCrossed } from 'lucide-react'
import type { RecetaCompartida } from '../types/recipe'
import { RecipeCard } from '../components/RecipeCard'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../hooks/useFavorites'
import { apiFetch, parseApiError } from '../lib/api'

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
  const { user } = useAuth()
  const { saveFavorite } = useFavorites()
  const [entradas, setEntradas] = useState<RecetaCompartida[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiFetch('/api/comunidad')
      if (!res.ok) throw new Error(await parseApiError(res))
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
          <h1 className="font-display font-black text-4xl text-bark dark:text-cream mb-1">Comunidad</h1>
          <p className="font-body text-muted dark:text-cream/60 text-sm">
            Recetas compartidas por la comunidad FoodAlchemy
          </p>
        </div>
        <button
          type="button"
          onClick={cargar}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-card dark:bg-bark/60 border border-bark/10 dark:border-cream/10 rounded-xl font-body text-sm text-muted hover:text-bark dark:hover:text-cream hover:border-gold/40 transition-all disabled:opacity-40 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin-slow' : ''}`} strokeWidth={2} />
          Actualizar
        </button>
      </header>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-up">
          <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center animate-bounce-sm">
            <Globe className="w-7 h-7 text-gold" strokeWidth={1.75} />
          </div>
          <p className="font-body text-muted dark:text-cream/60 text-sm">Cargando recetas...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex items-start gap-2 px-4 py-3 bg-spice/5 border border-spice/20 rounded-xl font-body text-sm text-spice">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
          {error}
        </div>
      )}

      {!isLoading && !error && entradas.length === 0 && (
        <div className="text-center py-20 animate-fade-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
            <UtensilsCrossed className="w-8 h-8 text-gold/50" strokeWidth={1.75} />
          </div>
          <p className="font-display font-bold text-bark dark:text-cream text-xl mb-2">Sin recetas aún</p>
          <p className="font-body text-muted dark:text-cream/60 text-sm max-w-xs mx-auto mb-6">
            Generá recetas y compartilas con la comunidad.
          </p>
          {user ? (
            <Link to="/" className="inline-block px-5 py-2.5 bg-gold text-white font-display font-bold rounded-2xl hover:bg-spice transition-colors">
              Generar mi primera receta
            </Link>
          ) : (
            <Link to="/login" className="inline-block px-5 py-2.5 bg-gold text-white font-display font-bold rounded-2xl hover:bg-spice transition-colors">
              Iniciá sesión para compartir
            </Link>
          )}
        </div>
      )}

      {!isLoading && !error && entradas.length > 0 && (
        <div className="space-y-6">
          {entradas.map((entrada, i) => (
            <div key={entrada.id ?? `${entrada.receta.nombre}-${entrada.timestamp}`} className="space-y-1.5">
              <p className="flex items-center gap-1.5 font-body text-xs text-muted dark:text-cream/50 px-1">
                <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                Compartida {timeAgo(entrada.timestamp)}
              </p>
              <RecipeCard
                receta={entrada.receta}
                index={i}
                autorNombre={entrada.autor_nombre}
                onSave={user ? async () => { await saveFavorite(entrada.receta) } : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
