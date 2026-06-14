export interface User {
  id: string
  email: string
  nombre: string
  dieta_preferida: string | null
}

export interface RegisterData {
  email: string
  password: string
  nombre: string
  dieta_preferida?: string | null
}

export interface ProfileUpdate {
  nombre?: string
  dieta_preferida?: string | null
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export const DIETAS = [
  { value: '', label: 'Sin preferencia' },
  { value: 'vegetariano', label: 'Vegetariano' },
  { value: 'vegano', label: 'Vegano' },
  { value: 'sin_gluten', label: 'Sin gluten' },
  { value: 'sin_lactosa', label: 'Sin lactosa' },
] as const
