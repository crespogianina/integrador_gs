import { useState } from 'react'
import {
  Check,
  ChevronDown,
  Clock,
  Copy,
  Flame,
  Heart,
  Lightbulb,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  User,
  Users,
} from 'lucide-react'
import type { Receta } from '../types/recipe'
import { RecipeImage } from './RecipeImage'
import { useToast } from '../context/ToastContext'

interface Props {
  receta: Receta
  index: number
  dietaBadge?: string
  autorNombre?: string
  onRemove?: () => void
  onSave?: () => Promise<void>
  onShareComunidad?: () => Promise<void> | void
}

const dificultadColor = {
  fácil: 'bg-herb/10 text-herb border-herb/20',
  intermedio: 'bg-gold/10 text-gold border-gold/20',
  difícil: 'bg-spice/10 text-spice border-spice/20',
}

export function RecipeCard({
  receta,
  index,
  dietaBadge,
  autorNombre,
  onRemove,
  onSave,
  onShareComunidad,
}: Props) {
  const { showToast } = useToast()
  const [expandida, setExpandida] = useState(false)
  const [guardada, setGuardada] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [compartida, setCompartida] = useState(false)
  const [porciones, setPorciones] = useState(receta.porciones)

  const factor = porciones / receta.porciones

  const handleGuardar = async () => {
    if (guardando || !onSave) return
    setGuardando(true)
    try {
      await onSave()
      setGuardada(true)
      showToast('Guardada en favoritos', 'success')
      setTimeout(() => setGuardada(false), 2000)
    } catch {
      showToast('No se pudo guardar', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const handleCompartir = () => {
    const ingredientes = [...receta.ingredientes_usados, ...receta.ingredientes_extra].join(', ')
    const pasosTexto = receta.pasos
      .map((paso, i) => `${i + 1}. ${paso.replace(/^Paso \d+:\s*/i, '')}`)
      .join('\n')

    const lineas = [
      receta.nombre,
      '',
      receta.descripcion,
      '',
      `${receta.tiempo_minutos} min | ${porciones} porciones | ${receta.dificultad}`,
      receta.calorias_aprox > 0 ? `~${Math.round(receta.calorias_aprox * factor)} kcal` : '',
      '',
      `Ingredientes: ${ingredientes}`,
      '',
      'Preparación:',
      pasosTexto,
    ]

    if (receta.tip_chef) lineas.push('', `Tip del chef: ${receta.tip_chef}`)
    lineas.push('', 'Generado con FoodAlchemy')

    navigator.clipboard.writeText(lineas.filter(Boolean).join('\n'))
    showToast('Receta copiada al portapapeles', 'success')
  }

  const handleListaCompras = () => {
    if (receta.ingredientes_extra.length === 0) {
      showToast('No necesitás ingredientes extra', 'info')
      return
    }
    navigator.clipboard.writeText(receta.ingredientes_extra.join(', '))
    showToast('Lista de compras copiada', 'success')
  }

  const handleShareComunidad = async () => {
    if (compartida || !onShareComunidad) return
    try {
      await onShareComunidad()
      setCompartida(true)
      showToast('Compartida en la comunidad', 'success')
      setTimeout(() => setCompartida(false), 2500)
    } catch {
      showToast('Iniciá sesión para compartir', 'error')
    }
  }

  return (
    <article
      className="group bg-card dark:bg-bark/60 border border-bark/8 dark:border-cream/10 rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${index * 120}ms`, animationFillMode: 'both', opacity: 0 }}
    >
      <div className="relative">
        <RecipeImage
          recipeName={receta.nombre}
          imageQuery={receta.busqueda_imagen}
          ingredientesUsados={receta.ingredientes_usados}
          className="h-48 w-full"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {dietaBadge && (
            <span className="px-2.5 py-1 bg-herb/90 text-white rounded-full font-body text-xs font-medium backdrop-blur-sm">
              {dietaBadge}
            </span>
          )}
        </div>
        {autorNombre && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-bark/60 text-cream rounded-full font-body text-xs backdrop-blur-sm">
            <User className="w-3 h-3" strokeWidth={2} />
            {autorNombre}
          </div>
        )}
      </div>

      <div className="p-5 pb-4">
        <div className="mb-3">
          <h3 className="font-display font-bold text-bark dark:text-cream text-xl leading-tight">{receta.nombre}</h3>
          <p className="font-body text-muted dark:text-cream/60 text-sm mt-1 leading-snug">{receta.descripcion}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-cream dark:bg-bark/40 rounded-full font-body text-xs text-muted dark:text-cream/70 border border-bark/8 dark:border-cream/10">
            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
            {receta.tiempo_minutos} min
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-cream dark:bg-bark/40 rounded-full font-body text-xs text-muted dark:text-cream/70 border border-bark/8 dark:border-cream/10">
            <Users className="w-3.5 h-3.5" strokeWidth={2} />
            {porciones} porc.
          </span>
          <span className={`px-2.5 py-1 rounded-full font-body text-xs border capitalize ${dificultadColor[receta.dificultad] ?? dificultadColor['fácil']}`}>
            {receta.dificultad}
          </span>
          {receta.calorias_aprox > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-cream dark:bg-bark/40 rounded-full font-body text-xs text-muted dark:text-cream/70 border border-bark/8 dark:border-cream/10">
              <Flame className="w-3.5 h-3.5 text-spice/70" strokeWidth={2} />
              ~{Math.round(receta.calorias_aprox * factor)} kcal
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <p className="font-body text-xs text-muted dark:text-cream/50 uppercase tracking-wider mb-1.5">Tenés</p>
            <div className="flex flex-wrap gap-1.5">
              {receta.ingredientes_usados.map((ing) => (
                <span key={ing} className="inline-flex items-center gap-1 px-2 py-0.5 bg-herb/10 border border-herb/20 text-herb rounded-full font-body text-xs">
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                  {ing}
                </span>
              ))}
            </div>
          </div>
          {receta.ingredientes_extra.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="font-body text-xs text-muted dark:text-cream/50 uppercase tracking-wider">También necesitás</p>
                <button
                  type="button"
                  onClick={handleListaCompras}
                  title="Copiar lista de compras"
                  aria-label="Copiar lista de compras"
                  className="flex items-center gap-1 font-body text-xs text-gold hover:text-spice transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" strokeWidth={2} />
                  Lista
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {receta.ingredientes_extra.map((ing) => (
                  <span key={ing} className="px-2 py-0.5 bg-cream dark:bg-bark/40 border border-bark/10 dark:border-cream/10 text-muted dark:text-cream/70 rounded-full font-body text-xs">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {expandida && (
        <div className="px-5 pb-5 border-t border-bark/5 dark:border-cream/10 pt-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-display font-bold text-bark dark:text-cream">Preparación</h4>
            <div className="flex items-center gap-2">
              <span className="font-body text-xs text-muted dark:text-cream/50">Porciones</span>
              <button
                type="button"
                aria-label="Menos porciones"
                onClick={() => setPorciones((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg border border-bark/10 dark:border-cream/10 flex items-center justify-center text-muted hover:text-gold"
              >
                <Minus className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
              <span className="font-mono text-sm text-bark dark:text-cream w-4 text-center">{porciones}</span>
              <button
                type="button"
                aria-label="Más porciones"
                onClick={() => setPorciones((p) => Math.min(12, p + 1))}
                className="w-7 h-7 rounded-lg border border-bark/10 dark:border-cream/10 flex items-center justify-center text-muted hover:text-gold"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>
          <ol className="space-y-3">
            {receta.pasos.map((paso, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/15 border border-gold/30 text-gold font-mono text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                <p className="font-body text-sm text-bark/80 dark:text-cream/80 leading-relaxed pt-0.5">
                  {paso.replace(/^Paso \d+:\s*/i, '')}
                </p>
              </li>
            ))}
          </ol>
          {receta.tip_chef && (
            <div className="mt-4 p-3.5 bg-gold/5 border border-gold/20 rounded-xl flex gap-2">
              <Lightbulb className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" strokeWidth={2} />
              <p className="font-body text-sm text-bark/70 dark:text-cream/70">
                <span className="font-semibold text-gold">Tip del chef:</span> {receta.tip_chef}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="px-5 py-3 bg-cream/50 dark:bg-bark/30 border-t border-bark/5 dark:border-cream/10 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setExpandida(!expandida)}
          className="flex items-center gap-1.5 font-body text-sm font-semibold text-gold hover:text-spice transition-colors"
          aria-expanded={expandida}
        >
          {expandida ? 'Ocultar pasos' : 'Ver preparación'}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandida ? 'rotate-180' : ''}`} strokeWidth={2} />
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={handleCompartir} title="Copiar receta" aria-label="Copiar receta" className="w-8 h-8 rounded-xl bg-cream dark:bg-bark/40 border border-bark/10 dark:border-cream/10 hover:border-gold/40 text-muted hover:text-gold flex items-center justify-center transition-all">
            <Copy className="w-4 h-4" strokeWidth={2} />
          </button>
          {onShareComunidad && (
            <button type="button" onClick={handleShareComunidad} title={compartida ? 'Compartida' : 'Compartir en comunidad'} aria-label="Compartir en comunidad" className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${compartida ? 'bg-herb/10 border-herb/30 text-herb' : 'bg-cream dark:bg-bark/40 border-bark/10 dark:border-cream/10 hover:border-gold/40 text-muted hover:text-gold'}`}>
              <Share2 className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
          {onRemove ? (
            <button type="button" onClick={onRemove} title="Quitar de favoritos" aria-label="Quitar de favoritos" className="w-8 h-8 rounded-xl border bg-spice/10 border-spice/30 text-spice hover:bg-spice/20 flex items-center justify-center transition-all">
              <Heart className="w-4 h-4 fill-current" strokeWidth={2} />
            </button>
          ) : onSave ? (
            <button type="button" onClick={handleGuardar} disabled={guardando} title="Guardar receta" aria-label="Guardar en favoritos" className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all disabled:opacity-50 ${guardada ? 'bg-herb/10 border-herb/30 text-herb' : 'bg-cream dark:bg-bark/40 border-bark/10 dark:border-cream/10 hover:border-spice/40 text-muted hover:text-spice'}`}>
              <Heart className={`w-4 h-4 ${guardada ? 'fill-current' : ''}`} strokeWidth={2} />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
