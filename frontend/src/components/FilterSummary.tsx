import { Cake, Clock, Leaf, SlidersHorizontal, Sun, Sunrise, Sunset, Users, UtensilsCrossed } from 'lucide-react'
import type { Filtros } from '../types/recipe'
import { DEFAULT_FILTROS } from '../types/recipe'

const DIETA_LABELS: Record<Filtros['dieta'], string> = {
  ninguna: 'Sin restricción',
  vegetariano: 'Vegetariano',
  vegano: 'Vegano',
  sin_gluten: 'Sin gluten',
  sin_lactosa: 'Sin lactosa',
}

const MOMENTO_LABELS: Record<Filtros['momento'], string> = {
  cualquiera: 'Cualquiera',
  desayuno: 'Desayuno',
  almuerzo: 'Almuerzo',
  cena: 'Cena',
}

const SABOR_LABELS: Record<Filtros['sabor'], string> = {
  cualquiera: 'Cualquiera',
  dulce: 'Dulce',
  salado: 'Salado',
}

const MOMENTO_ICONS = {
  desayuno: Sunrise,
  almuerzo: Sun,
  cena: Sunset,
} as const

interface Props {
  filtros: Filtros
}

export function FilterSummary({ filtros }: Props) {
  const activos =
    filtros.dieta !== 'ninguna' ||
    filtros.momento !== 'cualquiera' ||
    filtros.sabor !== 'cualquiera' ||
    filtros.complejidad !== 'cualquiera' ||
    filtros.tiempo_max !== DEFAULT_FILTROS.tiempo_max ||
    filtros.porciones !== DEFAULT_FILTROS.porciones

  if (!activos) return null

  return (
    <div className="flex flex-wrap items-center gap-2 px-1">
      <SlidersHorizontal className="w-3.5 h-3.5 text-muted" strokeWidth={2} />
      {filtros.dieta !== 'ninguna' && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-herb/10 text-herb rounded-full font-body text-xs">
          <Leaf className="w-3 h-3" strokeWidth={2} />
          {DIETA_LABELS[filtros.dieta]}
        </span>
      )}
      {filtros.momento !== 'cualquiera' && (() => {
        const Icon = MOMENTO_ICONS[filtros.momento]
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold/10 text-gold rounded-full font-body text-xs">
            <Icon className="w-3 h-3" strokeWidth={2} />
            {MOMENTO_LABELS[filtros.momento]}
          </span>
        )
      })()}
      {filtros.sabor !== 'cualquiera' && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-spice/10 text-spice rounded-full font-body text-xs">
          {filtros.sabor === 'dulce' ? (
            <Cake className="w-3 h-3" strokeWidth={2} />
          ) : (
            <UtensilsCrossed className="w-3 h-3" strokeWidth={2} />
          )}
          {SABOR_LABELS[filtros.sabor]}
        </span>
      )}
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cream dark:bg-bark/50 text-muted dark:text-cream/70 rounded-full font-body text-xs border border-bark/8">
        <Users className="w-3 h-3" strokeWidth={2} />
        {filtros.porciones} porc.
      </span>
      {filtros.complejidad !== 'cualquiera' && (
        <span className="px-2 py-0.5 bg-gold/10 text-gold rounded-full font-body text-xs capitalize">
          {filtros.complejidad}
        </span>
      )}
      {filtros.tiempo_max !== DEFAULT_FILTROS.tiempo_max && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cream dark:bg-bark/50 text-muted dark:text-cream/70 rounded-full font-body text-xs border border-bark/8">
          <Clock className="w-3 h-3" strokeWidth={2} />
          máx {filtros.tiempo_max} min
        </span>
      )}
    </div>
  )
}
