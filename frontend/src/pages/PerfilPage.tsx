import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Moon, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { DIETAS } from '../types/user'

export function PerfilPage() {
  const { user, updateProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [nombre, setNombre] = useState('')
  const [dietaPreferida, setDietaPreferida] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setNombre(user.nombre)
      setDietaPreferida(user.dieta_preferida ?? '')
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)
    try {
      await updateProfile({
        nombre,
        dieta_preferida: dietaPreferida || null,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el perfil')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-md mx-auto px-4 py-10 animate-fade-up">
      <header className="mb-6">
        <h1 className="font-display font-black text-4xl text-bark mb-1">Mi perfil</h1>
        <p className="font-body text-muted text-sm">Tu dieta preferida se aplica al generar recetas con IA.</p>
      </header>

      <div className="bg-card dark:bg-bark/60 border border-bark/8 dark:border-cream/10 rounded-3xl p-6 shadow-card mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-sm font-semibold text-bark dark:text-cream">Modo oscuro</p>
            <p className="font-body text-xs text-muted dark:text-cream/50">Más cómodo de noche</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-cream dark:bg-bark/40 border border-bark/10 dark:border-cream/10 flex items-center justify-center text-gold hover:text-spice transition-colors"
            aria-label="Alternar modo oscuro"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" strokeWidth={2} /> : <Moon className="w-5 h-5" strokeWidth={2} />}
          </button>
        </div>
      </div>

      <div className="bg-card dark:bg-bark/60 border border-bark/8 dark:border-cream/10 rounded-3xl p-6 shadow-card">
        <p className="font-body text-xs text-muted dark:text-cream/50 uppercase tracking-wider mb-1">Email</p>
        <p className="font-body text-bark dark:text-cream mb-5">{user.email}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-body text-xs text-muted uppercase tracking-wider mb-1.5 block">Nombre</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-3 bg-cream border border-bark/10 rounded-xl font-body text-sm focus:outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="font-body text-xs text-muted uppercase tracking-wider mb-1.5 block">Dieta preferida</label>
            <select
              value={dietaPreferida}
              onChange={(e) => setDietaPreferida(e.target.value)}
              className="w-full px-4 py-3 bg-cream border border-bark/10 rounded-xl font-body text-sm focus:outline-none focus:border-gold/50"
            >
              {DIETAS.map(({ value, label }) => (
                <option key={value || 'none'} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-start gap-2 px-4 py-3 bg-spice/5 border border-spice/20 rounded-xl font-body text-sm text-spice">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 px-4 py-3 bg-herb/5 border border-herb/20 rounded-xl font-body text-sm text-herb">
              <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
              Perfil actualizado
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gold text-white font-display font-bold rounded-2xl hover:bg-spice transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}
