import { ChefHat, Globe, Heart, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', end: true, icon: ChefHat, label: 'Generar' },
  { to: '/favoritos', icon: Heart, label: 'Favoritos' },
  { to: '/comunidad', icon: Globe, label: 'Comunidad' },
  { to: '/perfil', icon: User, label: 'Perfil' },
]

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-md border-t border-bark/8 dark:bg-bark/95 dark:border-cream/10 pb-safe">
      <div className="flex items-center justify-around h-14 max-w-3xl mx-auto px-2">
        {items.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                isActive ? 'text-gold' : 'text-muted dark:text-cream/50'
              }`
            }
          >
            <Icon className="w-5 h-5" strokeWidth={2} />
            <span className="font-body text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
