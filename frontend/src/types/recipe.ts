export interface Receta {
  nombre: string
  busqueda_imagen?: string
  emoji: string
  descripcion: string
  tiempo_minutos: number
  porciones: number
  dificultad: 'fácil' | 'intermedio' | 'difícil'
  calorias_aprox: number
  ingredientes_usados: string[]
  ingredientes_extra: string[]
  pasos: string[]
  tip_chef: string
}

export interface RecetasResponse {
  recetas: Receta[]
}

export interface Filtros {
  dieta: 'ninguna' | 'vegetariano' | 'vegano' | 'sin_gluten' | 'sin_lactosa'
  porciones: number
  complejidad: 'cualquiera' | 'fácil' | 'intermedio' | 'difícil'
  tiempo_max: number
  momento: 'cualquiera' | 'desayuno' | 'almuerzo' | 'cena'
  sabor: 'cualquiera' | 'dulce' | 'salado'
}

export const DEFAULT_FILTROS: Filtros = {
  dieta: 'ninguna',
  porciones: 2,
  complejidad: 'cualquiera',
  tiempo_max: 60,
  momento: 'cualquiera',
  sabor: 'cualquiera',
}

export interface RecetaCompartida {
  id?: string
  receta: Receta
  timestamp: string
  autor_nombre?: string
}

export const SUGERENCIAS = [
  'tomate', 'cebolla', 'ajo', 'huevo', 'pollo', 'papa',
  'arroz', 'pasta', 'zanahoria', 'queso', 'atún', 'limón',
  'espinaca', 'pimiento', 'hongos', 'zapallo', 'manteca', 'crema',
]
