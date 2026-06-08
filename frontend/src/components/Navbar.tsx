import { NavLink } from 'react-router-dom'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-sm border-b border-bark/8">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <NavLink to="/" className="font-display font-black text-2xl text-bark leading-none">
          Recetas<span className="text-gold italic">IA</span>
        </NavLink>

        <div className="flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-xl font-body text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gold/10 text-gold'
                  : 'text-muted hover:text-bark hover:bg-cream'
              }`
            }
          >
            🍳 Generar
          </NavLink>
          <NavLink
            to="/favoritos"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-xl font-body text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gold/10 text-gold'
                  : 'text-muted hover:text-bark hover:bg-cream'
              }`
            }
          >
            ❤ Favoritos
          </NavLink>
          <NavLink
            to="/comunidad"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-xl font-body text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gold/10 text-gold'
                  : 'text-muted hover:text-bark hover:bg-cream'
              }`
            }
          >
            🌐 Comunidad
          </NavLink>
        </div>
      </div>
    </nav>
  )
}
