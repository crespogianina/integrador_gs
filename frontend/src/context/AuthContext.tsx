import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch, clearToken, parseApiError, setToken, getToken } from '../lib/api'
import type { ProfileUpdate, RegisterData, TokenResponse, User } from '../types/user'

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (data: ProfileUpdate) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchCurrentUser(): Promise<User> {
  const response = await apiFetch('/auth/me')
  if (!response.ok) throw new Error(await parseApiError(response))
  return response.json()
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!getToken()) {
        setIsLoading(false)
        return
      }
      try {
        const currentUser = await fetchCurrentUser()
        if (!cancelled) setUser(currentUser)
      } catch {
        clearToken()
        if (!cancelled) {
          setTokenState(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) throw new Error(await parseApiError(response))

    const data: TokenResponse = await response.json()
    setToken(data.access_token)
    setTokenState(data.access_token)
    setUser(await fetchCurrentUser())
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    const response = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        nombre: data.nombre,
        dieta_preferida: data.dieta_preferida || null,
      }),
    })
    if (!response.ok) throw new Error(await parseApiError(response))
    await login(data.email, data.password)
  }, [login])

  const logout = useCallback(() => {
    clearToken()
    setTokenState(null)
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (data: ProfileUpdate) => {
    const response = await apiFetch('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(await parseApiError(response))
    setUser(await response.json())
  }, [])

  const value = useMemo(
    () => ({ user, token, isLoading, login, register, logout, updateProfile }),
    [user, token, isLoading, login, register, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
