import { useEffect, useState, useCallback } from 'react'
import { AlertCircle, ChefHat, History, Leaf, Search, SlidersHorizontal, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { IngredientInput } from '../components/IngredientInput'
import { FilterPanel } from '../components/FilterPanel'
import { FilterSummary } from '../components/FilterSummary'
import { RecipeCard } from '../components/RecipeCard'
import { LoadingChef } from '../components/LoadingChef'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useRecipeGenerator } from '../hooks/useRecipeGenerator'
import { useFavorites } from '../hooks/useFavorites'
import { getSearchHistory, saveSearchHistory } from '../hooks/useSearchHistory'
import { apiFetch, parseApiError } from '../lib/api'
import { DIETAS } from '../types/user'
import { DEFAULT_FILTROS } from '../types/recipe'
import type { Filtros, Receta } from '../types/recipe'

const DIETAS_VALIDAS = new Set(['vegetariano', 'vegano', 'sin_gluten', 'sin_lactosa'])

const DIETA_BADGE: Record<string, string> = {
  vegetariano: 'Vegetariano',
  vegano: 'Vegano',
  sin_gluten: 'Sin gluten',
  sin_lactosa: 'Sin lactosa',
}

function filtrosConPreferencia(dietaPreferida: string | null): Filtros {
  if (dietaPreferida && DIETAS_VALIDAS.has(dietaPreferida)) {
    return { ...DEFAULT_FILTROS, dieta: dietaPreferida as Filtros['dieta'] }
  }
  return DEFAULT_FILTROS
}

export function GenerarPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [ingredientes, setIngredientes] = useState<string[]>([])
  const [filtros, setFiltros] = useState<Filtros>(DEFAULT_FILTROS)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [preferenciaAplicada, setPreferenciaAplicada] = useState(false)
  const [historial, setHistorial] = useState<string[][]>(() => getSearchHistory())

  const { recetas, isLoading, error, generarRecetas, limpiar } = useRecipeGenerator()
  const { saveFavorite } = useFavorites()

  useEffect(() => {
    if (user?.dieta_preferida && DIETAS_VALIDAS.has(user.dieta_preferida)) {
      setFiltros(filtrosConPreferencia(user.dieta_preferida))
      setPreferenciaAplicada(true)
    }
  }, [user?.dieta_preferida])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (recetas.length > 0) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [recetas.length])

  const handleBuscar = () => {
    if (ingredientes.length === 0) return
    saveSearchHistory(ingredientes)
    setHistorial(getSearchHistory())
    generarRecetas(ingredientes, filtros)
  }

  const handleTengoHambre = () => {
    const filtrosRapidos: Filtros = { ...filtros, complejidad: 'fácil', tiempo_max: 15 }
    setFiltros(filtrosRapidos)
    if (ingredientes.length > 0) {
      saveSearchHistory(ingredientes)
      setHistorial(getSearchHistory())
      generarRecetas(ingredientes, filtrosRapidos)
    }
  }

  const handleNuevaBusqueda = () => {
    limpiar()
    setIngredientes([])
    setFiltros(filtrosConPreferencia(user?.dieta_preferida ?? null))
  }

  const compartirEnComunidad = useCallback(async (receta: Receta) => {
    const res = await apiFetch('/api/comunidad', {
      method: 'POST',
      body: JSON.stringify(receta),
    })
    if (!res.ok) throw new Error(await parseApiError(res))
  }, [])

  const etiquetaDietaPreferida = DIETAS.find((d) => d.value === user?.dieta_preferida)?.label
  const dietaBadge = filtros.dieta !== 'ninguna' ? DIETA_BADGE[filtros.dieta] : undefined
  const tieneResultados = recetas.length > 0
  const filtrosActivos =
    filtros.dieta !== 'ninguna' ||
    filtros.momento !== 'cualquiera' ||
    filtros.sabor !== 'cualquiera' ||
    filtros.complejidad !== 'cualquiera' ||
    filtros.tiempo_max !== DEFAULT_FILTROS.tiempo_max

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {!tieneResultados && !isLoading && (
        <header className="text-center mb-8 animate-fade-up">
          <p className="font-body text-muted dark:text-cream/60 text-lg max-w-sm mx-auto">
            Decime qué tenés en la heladera y te digo qué podés cocinar.
          </p>
          {preferenciaAplicada && etiquetaDietaPreferida && (
            <p className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-herb/10 border border-herb/20 text-herb rounded-full font-body text-xs">
              <Leaf className="w-3.5 h-3.5" strokeWidth={2} />
              Tu preferencia ({etiquetaDietaPreferida}) se aplica automáticamente
            </p>
          )}
        </header>
      )}

      {!tieneResultados && (
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="bg-card dark:bg-bark/60 border border-bark/8 dark:border-cream/10 rounded-2xl p-5 shadow-sm">
            <label className="font-body text-xs text-muted dark:text-cream/50 uppercase tracking-wider mb-3 block">
              ¿Qué ingredientes tenés?
            </label>
            <IngredientInput ingredientes={ingredientes} onChange={setIngredientes} />
          </div>

          {historial.length > 0 && ingredientes.length === 0 && (
            <div className="bg-card dark:bg-bark/60 border border-bark/8 dark:border-cream/10 rounded-2xl p-4">
              <p className="flex items-center gap-1.5 font-body text-xs text-muted dark:text-cream/50 uppercase tracking-wider mb-2">
                <History className="w-3.5 h-3.5" strokeWidth={2} />
                Búsquedas recientes
              </p>
              <div className="flex flex-wrap gap-2">
                {historial.map((h) => (
                  <button
                    key={h.join('|')}
                    type="button"
                    onClick={() => setIngredientes(h)}
                    className="px-3 py-1.5 bg-cream dark:bg-bark/40 border border-bark/10 dark:border-cream/10 rounded-full font-body text-xs text-muted dark:text-cream/70 hover:border-gold/40 hover:text-gold transition-colors"
                  >
                    {h.slice(0, 3).join(', ')}{h.length > 3 ? '…' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="w-full flex items-center justify-between px-4 py-3 bg-card dark:bg-bark/60 border border-bark/8 dark:border-cream/10 rounded-2xl font-body text-sm text-muted dark:text-cream/60 hover:text-bark dark:hover:text-cream transition-colors"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" strokeWidth={2} />
              Filtros
              {filtrosActivos && (
                <span className="px-1.5 py-0.5 bg-gold text-white rounded-full text-xs font-mono">!</span>
              )}
            </span>
          </button>

          {!mostrarFiltros && <FilterSummary filtros={filtros} />}

          {mostrarFiltros && (
            <div className="animate-fade-up">
              <FilterPanel filtros={filtros} onChange={setFiltros} onReset={() => setFiltros(filtrosConPreferencia(user?.dieta_preferida ?? null))} />
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBuscar}
              disabled={ingredientes.length === 0 || isLoading}
              title={ingredientes.length === 0 ? 'Agregá al menos un ingrediente' : undefined}
              className="flex-1 py-4 bg-gold text-white font-display font-bold text-lg rounded-2xl hover:bg-spice active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-gold/25 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" strokeWidth={2} />
              {isLoading ? 'Generando...' : '¿Qué puedo cocinar?'}
            </button>
            <button
              type="button"
              onClick={handleTengoHambre}
              disabled={ingredientes.length === 0 || isLoading}
              title="Recetas rápidas (máx 15 min, fáciles)"
              className="px-4 py-4 bg-card dark:bg-bark/60 border-2 border-bark/10 dark:border-cream/10 text-bark dark:text-cream rounded-2xl font-body text-sm font-semibold hover:border-spice/40 hover:text-spice active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-gold" strokeWidth={2} />
              Tengo hambre ya
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 px-4 py-3 bg-spice/5 border border-spice/20 rounded-xl font-body text-sm text-spice">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
              {error}
            </div>
          )}
        </div>
      )}

      {isLoading && <LoadingChef />}

      {tieneResultados && !isLoading && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-bark dark:text-cream text-2xl">
              {recetas.length} receta{recetas.length > 1 ? 's' : ''} encontrada{recetas.length > 1 ? 's' : ''}
            </h2>
            <button
              type="button"
              onClick={handleNuevaBusqueda}
              className="font-body text-sm text-muted dark:text-cream/60 hover:text-spice transition-colors"
            >
              ← Nueva búsqueda
            </button>
          </div>
          <div className="space-y-4">
            {recetas.map((receta, i) => (
              <RecipeCard
                key={receta.nombre}
                receta={receta}
                index={i}
                dietaBadge={dietaBadge}
                onSave={async () => { await saveFavorite(receta) }}
                onShareComunidad={() => compartirEnComunidad(receta)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
