import { useState } from 'react'
import type { Receta } from '../types/recipe'

interface Props {
  receta: Receta
  index: number
  onRemove?: () => void
  onShareComunidad?: () => void
}

const dificultadColor = {
  fácil: 'bg-herb/10 text-herb border-herb/20',
  intermedio: 'bg-gold/10 text-gold border-gold/20',
  difícil: 'bg-spice/10 text-spice border-spice/20',
}

export function RecipeCard({ receta, index, onRemove, onShareComunidad }: Props) {
  const [expandida, setExpandida] = useState(false)
  const [guardada, setGuardada] = useState(false)
  const [compartida, setCompartida] = useState(false)

  const handleGuardar = () => {
    const guardadas = JSON.parse(localStorage.getItem('recetas_guardadas') ?? '[]')
    const yaGuardada = guardadas.some((r: Receta) => r.nombre === receta.nombre)
    if (!yaGuardada) {
      localStorage.setItem('recetas_guardadas', JSON.stringify([...guardadas, receta]))
    }
    setGuardada(true)
    setTimeout(() => setGuardada(false), 2000)
  }

  const handleCompartir = () => {
    const texto = `🍽️ ${receta.nombre}\n\n${receta.descripcion}\n\n⏱ ${receta.tiempo_minutos} min | 👥 ${receta.porciones} porciones\n\nIngredientes: ${[...receta.ingredientes_usados, ...receta.ingredientes_extra].join(', ')}\n\nGenerado con RecetasIA 🤖`
    navigator.clipboard.writeText(texto)
  }

  const handleShareComunidad = () => {
    if (compartida || !onShareComunidad) return
    onShareComunidad()
    setCompartida(true)
    setTimeout(() => setCompartida(false), 2500)
  }

  return (
    <div
      className="bg-card border border-bark/8 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-bark/5 transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${index * 120}ms`, animationFillMode: 'both', opacity: 0 }}
    >
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{receta.emoji}</span>
            <div>
              <h3 className="font-display font-bold text-bark text-xl leading-tight">{receta.nombre}</h3>
              <p className="font-body text-muted text-sm mt-0.5 leading-snug">{receta.descripcion}</p>
            </div>
          </div>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="flex items-center gap-1 px-2.5 py-1 bg-cream rounded-full font-body text-xs text-muted border border-bark/8">
            ⏱ {receta.tiempo_minutos} min
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 bg-cream rounded-full font-body text-xs text-muted border border-bark/8">
            👥 {receta.porciones} porc.
          </span>
          <span className={`px-2.5 py-1 rounded-full font-body text-xs border capitalize ${dificultadColor[receta.dificultad] ?? dificultadColor['fácil']}`}>
            {receta.dificultad}
          </span>
          {receta.calorias_aprox > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-cream rounded-full font-body text-xs text-muted border border-bark/8">
              🔥 ~{receta.calorias_aprox} kcal
            </span>
          )}
        </div>

        {/* Ingredientes */}
        <div className="space-y-2">
          <div>
            <p className="font-body text-xs text-muted uppercase tracking-wider mb-1.5">Tenés</p>
            <div className="flex flex-wrap gap-1.5">
              {receta.ingredientes_usados.map((ing) => (
                <span key={ing} className="px-2 py-0.5 bg-herb/10 border border-herb/20 text-herb rounded-full font-body text-xs">
                  ✓ {ing}
                </span>
              ))}
            </div>
          </div>
          {receta.ingredientes_extra.length > 0 && (
            <div>
              <p className="font-body text-xs text-muted uppercase tracking-wider mb-1.5">También necesitás</p>
              <div className="flex flex-wrap gap-1.5">
                {receta.ingredientes_extra.map((ing) => (
                  <span key={ing} className="px-2 py-0.5 bg-cream border border-bark/10 text-muted rounded-full font-body text-xs">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expandible: pasos + tip */}
      {expandida && (
        <div className="px-5 pb-5 border-t border-bark/5 pt-4 animate-fade-in">
          <h4 className="font-display font-bold text-bark mb-3">Preparación</h4>
          <ol className="space-y-3">
            {receta.pasos.map((paso, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/15 border border-gold/30 text-gold font-mono text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                <p className="font-body text-sm text-bark/80 leading-relaxed pt-0.5">
                  {paso.replace(/^Paso \d+:\s*/i, '')}
                </p>
              </li>
            ))}
          </ol>
          {receta.tip_chef && (
            <div className="mt-4 p-3.5 bg-gold/5 border border-gold/20 rounded-xl">
              <p className="font-body text-sm text-bark/70">
                <span className="font-semibold text-gold">👨‍🍳 Tip del chef:</span> {receta.tip_chef}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="px-5 py-3 bg-cream/50 border-t border-bark/5 flex items-center justify-between">
        <button
          onClick={() => setExpandida(!expandida)}
          className="flex items-center gap-1.5 font-body text-sm font-semibold text-gold hover:text-spice transition-colors"
        >
          {expandida ? 'Ocultar pasos' : 'Ver preparación'}
          <svg className={`w-4 h-4 transition-transform duration-200 ${expandida ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleCompartir}
            title="Copiar receta"
            className="w-8 h-8 rounded-xl bg-cream border border-bark/10 hover:border-gold/40 text-muted hover:text-gold flex items-center justify-center transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          {onShareComunidad && (
            <button
              onClick={handleShareComunidad}
              title={compartida ? '¡Compartida!' : 'Compartir en comunidad'}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                compartida
                  ? 'bg-herb/10 border-herb/30 text-herb'
                  : 'bg-cream border-bark/10 hover:border-gold/40 text-muted hover:text-gold'
              }`}
            >
              {compartida ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              )}
            </button>
          )}
          {onRemove ? (
            <button
              onClick={onRemove}
              title="Quitar de favoritos"
              className="w-8 h-8 rounded-xl border bg-spice/10 border-spice/30 text-spice hover:bg-spice/20 flex items-center justify-center transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleGuardar}
              title="Guardar receta"
              className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                guardada
                  ? 'bg-herb/10 border-herb/30 text-herb'
                  : 'bg-cream border-bark/10 hover:border-spice/40 text-muted hover:text-spice'
              }`}
            >
              <svg className="w-4 h-4" fill={guardada ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
