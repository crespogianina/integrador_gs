import { useEffect } from 'react'
import { AlertCircle, Heart } from 'lucide-react'
import { apiFetch } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { useFavorites } from '../hooks/useFavorites'
import { RecipeCard } from '../components/RecipeCard'

export function FavoritosPage() {
  const { showToast } = useToast()
  const { favoritos, isLoading, error, loadFavoritos, deleteFavorite } = useFavorites()

  useEffect(() => {
    loadFavoritos()
  }, [loadFavoritos])

  const compartirEnComunidad = async (receta: (typeof favoritos)[0]['receta']) => {
    const res = await apiFetch('/api/comunidad', {
      method: 'POST',
      body: JSON.stringify(receta),
    })
    if (!res.ok) throw new Error('Error al compartir')
  }

  const eliminar = async (id: string) => {
    try {
      await deleteFavorite(id)
      showToast('Eliminada de favoritos', 'info')
    } catch {
      showToast('No se pudo eliminar', 'error')
    }
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

      {isLoading && (
        <p className="font-body text-muted text-center py-10 animate-pulse">Cargando favoritos...</p>
      )}

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 bg-spice/5 border border-spice/20 rounded-xl font-body text-sm text-spice mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
          {error}
        </div>
      )}

      {!isLoading && favoritos.length === 0 && (
        <div className="text-center py-20 animate-fade-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
            <Heart className="w-8 h-8 text-gold/50" strokeWidth={1.75} />
          </div>
          <p className="font-display font-bold text-bark text-xl mb-2">Sin favoritos aún</p>
          <p className="font-body text-muted text-sm max-w-xs mx-auto">
            Generá recetas y tocá el corazón para guardar las que más te gusten.
          </p>
        </div>
      )}

      {!isLoading && favoritos.length > 0 && (
        <div className="space-y-4">
          {favoritos.map(({ id, receta }, i) => (
            <RecipeCard
              key={id}
              receta={receta}
              index={i}
              onRemove={() => eliminar(id)}
              onShareComunidad={() => compartirEnComunidad(receta)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
