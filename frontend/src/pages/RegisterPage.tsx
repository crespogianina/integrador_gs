import { useState } from 'react'
import { AlertCircle, ChefHat } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DIETAS } from '../types/user'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [dietaPreferida, setDietaPreferida] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await register({
        email,
        password,
        nombre,
        dieta_preferida: dietaPreferida || null,
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 animate-fade-up">
      <div className="bg-card dark:bg-bark/60 border border-bark/8 dark:border-cream/10 rounded-3xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold text-white">
            <ChefHat className="w-5 h-5" strokeWidth={2.5} />
          </span>
          <div>
            <h1 className="font-display font-black text-2xl text-bark dark:text-cream leading-tight">Crear cuenta</h1>
            <p className="font-body text-muted dark:text-cream/60 text-xs">FoodAlchemy</p>
          </div>
        </div>
        <p className="font-body text-muted dark:text-cream/60 text-sm mb-6">Unite y cociná con lo que tenés.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-body text-xs text-muted uppercase tracking-wider mb-1.5 block">Nombre</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-3 bg-cream border border-bark/10 rounded-xl font-body text-sm focus:outline-none focus:border-gold/50"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="font-body text-xs text-muted uppercase tracking-wider mb-1.5 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-cream border border-bark/10 rounded-xl font-body text-sm focus:outline-none focus:border-gold/50"
              placeholder="chef@foodalchemy.dev"
            />
          </div>
          <div>
            <label className="font-body text-xs text-muted uppercase tracking-wider mb-1.5 block">Contraseña</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-cream border border-bark/10 rounded-xl font-body text-sm focus:outline-none focus:border-gold/50"
              placeholder="shhh"
            />
          </div>
          <div>
            <label className="font-body text-xs text-muted uppercase tracking-wider mb-1.5 block">
              Dieta preferida (opcional)
            </label>
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gold text-white font-display font-bold rounded-2xl hover:bg-spice transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <p className="font-body text-sm text-muted text-center mt-5">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-gold font-semibold hover:text-spice">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
