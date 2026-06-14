// En dev, rutas relativas → proxy de Vite → backend (evita CORS)
const API_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? '' : 'http://localhost:8000')
const TOKEN_KEY = 'foodalchemy_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export async function parseApiError(response: Response): Promise<string> {
  try {
    const data = await response.json()
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.detail)) {
      return data.detail.map((item: { msg?: string }) => item.msg ?? 'Error de validación').join(', ')
    }
    return `Error ${response.status}`
  } catch {
    return `Error ${response.status}`
  }
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  try {
    return await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch (err) {
    if (err instanceof TypeError) {
      const destino = API_URL || 'proxy de Vite → localhost:8000'
      throw new Error(
        `No se pudo conectar con el backend (${destino}). Revisá frontend/.env: VITE_API_URL debe estar vacío en local o apuntar a http://localhost:8000.`,
      )
    }
    throw err
  }
}

export { API_URL }
