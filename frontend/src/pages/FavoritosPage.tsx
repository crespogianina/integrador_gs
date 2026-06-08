import { useState, useEffect } from 'react'
import type { Receta } from '../types/recipe'
import { RecipeCard } from '../components/RecipeCard'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function FavoritosPage() {
  const [favoritos, setFavoritos] = useState<Receta[]>([])

  useEffect(() => {
    const guardadas = JSON.parse(localStorage.getItem('recetas_guardadas') ?? '[]')
    setFavoritos(guardadas)
  }, [])

  const compartirEnComunidad = async (receta: Receta) => {
    try {
      await fetch(`${API_URL}/api/comunidad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receta),
      })
    } catch {
      // best-effort
    }
  }

  const eliminar = (nombre: string) => {
    const actualizados = favoritos.filter((r) => r.nombre !== nombre)
    setFavoritos(actualizados)
    localStorage.setItem('recetas_guardadas', JSON.stringify(actualizados))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <header className="mb-8 animate-fade-up">
        <h1 className="font-display font-black text-4xl text-bark mb-1">Mis Favoritos</h1>
        <p className="font-body text-muted text-sm">
          {favoritos.length > 0
            ? `${favoritos.length} receta${favoritos.length > 1 ? 's' : ''} guardada${favoritos.length > 1 ? 's' : ''}`
            : 'Todavía no guardaste ninguna receta.'}
        </p>
      </header>

      {favoritos.length === 0 ? (
        <div className="text-center py-20 animate-fade-up">
          <div className="text-6xl mb-4">🤍</div>
          <p className="font-display font-bold text-bark text-xl mb-2">Sin favoritos aún</p>
          <p className="font-body text-muted text-sm max-w-xs mx-auto">
            Generá recetas y tocá el corazón para guardar las que más te gusten.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {favoritos.map((receta, i) => (
            <RecipeCard
              key={receta.nombre}
              receta={receta}
              index={i}
              onRemove={() => eliminar(receta.nombre)}
              onShareComunidad={() => compartirEnComunidad(receta)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
