import { useState } from 'react'
import { IngredientInput } from '../components/IngredientInput'
import { FilterPanel } from '../components/FilterPanel'
import { RecipeCard } from '../components/RecipeCard'
import { LoadingChef } from '../components/LoadingChef'
import { useRecipeGenerator } from '../hooks/useRecipeGenerator'
import { DEFAULT_FILTROS } from '../types/recipe'
import type { Filtros, Receta } from '../types/recipe'

export function GenerarPage() {
  const [ingredientes, setIngredientes] = useState<string[]>([])
  const [filtros, setFiltros] = useState<Filtros>(DEFAULT_FILTROS)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const { recetas, isLoading, error, generarRecetas, limpiar } = useRecipeGenerator()

  const handleBuscar = () => {
    if (ingredientes.length === 0) return
    generarRecetas(ingredientes, filtros)
  }

  const handleTengoHambre = () => {
    const filtrosRapidos: Filtros = { ...filtros, complejidad: 'fácil', tiempo_max: 15 }
    setFiltros(filtrosRapidos)
    if (ingredientes.length > 0) generarRecetas(ingredientes, filtrosRapidos)
  }

  const handleNuevaBusqueda = () => {
    limpiar()
    setIngredientes([])
    setFiltros(DEFAULT_FILTROS)
  }

  const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

  const compartirEnComunidad = async (receta: Receta) => {
    try {
      await fetch(`${API_URL}/api/comunidad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receta),
      })
    } catch {
      // share is best-effort, don't surface errors
    }
  }

  const tieneResultados = recetas.length > 0
  const filtrosActivos =
    filtros.dieta !== 'ninguna' ||
    filtros.complejidad !== 'cualquiera' ||
    filtros.tiempo_max !== DEFAULT_FILTROS.tiempo_max

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {!tieneResultados && !isLoading && (
        <header className="text-center mb-8 animate-fade-up">
          <p className="font-body text-muted text-lg max-w-sm mx-auto">
            Decime qué tenés en la heladera y te digo qué podés cocinar.
          </p>
        </header>
      )}

      {!tieneResultados && (
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="bg-card border border-bark/8 rounded-2xl p-5 shadow-sm">
            <label className="font-body text-xs text-muted uppercase tracking-wider mb-3 block">
              ¿Qué ingredientes tenés?
            </label>
            <IngredientInput ingredientes={ingredientes} onChange={setIngredientes} />
          </div>

          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="w-full flex items-center justify-between px-4 py-3 bg-card border border-bark/8 rounded-2xl font-body text-sm text-muted hover:text-bark transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filtros
              {filtrosActivos && (
                <span className="px-1.5 py-0.5 bg-gold text-white rounded-full text-xs font-mono">!</span>
              )}
            </span>
            <svg className={`w-4 h-4 transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {mostrarFiltros && (
            <div className="animate-fade-up">
              <FilterPanel filtros={filtros} onChange={setFiltros} onReset={() => setFiltros(DEFAULT_FILTROS)} />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleBuscar}
              disabled={ingredientes.length === 0 || isLoading}
              className="flex-1 py-4 bg-gold text-white font-display font-bold text-lg rounded-2xl
                hover:bg-spice active:scale-95 transition-all duration-200
                disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-gold/20"
            >
              {isLoading ? 'Generando...' : '¿Qué puedo cocinar? 🔍'}
            </button>
            <button
              onClick={handleTengoHambre}
              disabled={ingredientes.length === 0 || isLoading}
              title="Recetas rápidas (máx 15 min, fáciles)"
              className="px-4 py-4 bg-card border-2 border-bark/10 text-bark rounded-2xl font-body text-sm font-semibold
                hover:border-spice/40 hover:text-spice active:scale-95 transition-all duration-200
                disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap"
            >
              ⚡ Tengo hambre ya
            </button>
          </div>

          {error && (
            <div className="px-4 py-3 bg-spice/5 border border-spice/20 rounded-xl font-body text-sm text-spice">
              ⚠ {error}
            </div>
          )}
        </div>
      )}

      {isLoading && <LoadingChef />}

      {tieneResultados && !isLoading && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-bark text-2xl">
              {recetas.length} receta{recetas.length > 1 ? 's' : ''} encontrada{recetas.length > 1 ? 's' : ''}
            </h2>
            <button
              onClick={handleNuevaBusqueda}
              className="font-body text-sm text-muted hover:text-spice transition-colors flex items-center gap-1"
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
                onShareComunidad={() => compartirEnComunidad(receta)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
