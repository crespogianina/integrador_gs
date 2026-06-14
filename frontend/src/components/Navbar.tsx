import { NavLink, useNavigate } from 'react-router-dom'
import { ChefHat, Globe, Heart, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function NavItem({
  to,
  end,
  icon: Icon,
  label,
}: {
  to: string
  end?: boolean
  icon: typeof ChefHat
  label: string
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-body text-sm font-medium transition-all duration-150 ${
          isActive ? 'bg-gold/10 text-gold' : 'text-muted hover:text-bark hover:bg-cream'
        }`
      }
    >
      <Icon className="w-4 h-4" strokeWidth={2} />
      <span className="hidden sm:inline">{label}</span>
    </NavLink>
  )
}

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 bg-card/95 dark:bg-bark/95 backdrop-blur-md border-b border-bark/8 dark:border-cream/10 shadow-sm">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 font-display font-black text-xl text-bark dark:text-cream leading-none">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gold text-white">
            <ChefHat className="w-4 h-4" strokeWidth={2.5} />
          </span>
          Food<span className="text-gold italic">Alchemy</span>
        </NavLink>

        <div className="hidden md:flex items-center gap-0.5">
          {user && (
            <>
              <NavItem to="/" end icon={ChefHat} label="Generar" />
              <NavItem to="/favoritos" icon={Heart} label="Favoritos" />
              <NavItem to="/comunidad" icon={Globe} label="Comunidad" />
              <NavItem to="/perfil" icon={User} label="Perfil" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-body text-sm font-medium text-muted hover:text-spice hover:bg-cream transition-all duration-150"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" strokeWidth={2} />
              </button>
            </>
          )}
          {!user && (
            <>
              <NavLink
                to="/login"
                className="px-3 py-1.5 rounded-xl font-body text-sm font-medium text-muted hover:text-bark hover:bg-cream transition-all duration-150"
              >
                Entrar
              </NavLink>
              <NavLink
                to="/register"
                className="px-3 py-1.5 rounded-xl font-body text-sm font-medium bg-gold text-white hover:bg-spice transition-all duration-150 shadow-sm"
              >
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
