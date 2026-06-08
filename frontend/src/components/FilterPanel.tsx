import type { Filtros } from '../types/recipe'

interface Props {
  filtros: Filtros
  onChange: (f: Filtros) => void
  onReset: () => void
}

export function FilterPanel({ filtros, onChange, onReset }: Props) {
  const set = <K extends keyof Filtros>(key: K, value: Filtros[K]) =>
    onChange({ ...filtros, [key]: value })

  return (
    <div className="bg-card border border-bark/8 rounded-2xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-bark font-bold text-lg">Filtros</h3>
        <button onClick={onReset} className="font-body text-xs text-muted hover:text-spice transition-colors">
          Resetear
        </button>
      </div>

      {/* Dieta */}
      <div>
        <label className="font-body text-xs text-muted uppercase tracking-wider mb-2 block">Restricción dietaria</label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'ninguna', label: 'Sin restricción' },
            { value: 'vegetariano', label: '🥦 Vegetariano' },
            { value: 'vegano', label: '🌱 Vegano' },
            { value: 'sin_gluten', label: '🌾 Sin gluten' },
            { value: 'sin_lactosa', label: '🥛 Sin lactosa' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => set('dieta', value as Filtros['dieta'])}
              className={`px-3 py-1.5 rounded-xl font-body text-xs font-medium transition-all duration-150 ${
                filtros.dieta === value
                  ? 'bg-herb text-white'
                  : 'bg-cream text-muted hover:text-bark border border-bark/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Porciones */}
      <div>
        <label className="font-body text-xs text-muted uppercase tracking-wider mb-2 flex justify-between">
          <span>Porciones</span>
          <span className="font-display font-bold text-gold text-sm normal-case">{filtros.porciones} persona{filtros.porciones > 1 ? 's' : ''}</span>
        </label>
        <input
          type="range" min={1} max={8} value={filtros.porciones}
          onChange={(e) => set('porciones', Number(e.target.value))}
          className="w-full accent-gold"
        />
        <div className="flex justify-between font-mono text-xs text-muted/40 mt-0.5">
          <span>1</span><span>8</span>
        </div>
      </div>

      {/* Complejidad */}
      <div>
        <label className="font-body text-xs text-muted uppercase tracking-wider mb-2 block">Complejidad</label>
        <div className="grid grid-cols-4 gap-1.5">
          {(['cualquiera', 'fácil', 'intermedio', 'difícil'] as const).map((c) => (
            <button
              key={c}
              onClick={() => set('complejidad', c)}
              className={`py-2 rounded-xl font-body text-xs font-medium capitalize transition-all duration-150 ${
                filtros.complejidad === c
                  ? 'bg-gold text-white'
                  : 'bg-cream text-muted hover:text-bark border border-bark/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Tiempo */}
      <div>
        <label className="font-body text-xs text-muted uppercase tracking-wider mb-2 block">Tiempo máximo</label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { value: 15, label: '15 min' },
            { value: 30, label: '30 min' },
            { value: 60, label: '1 hora' },
            { value: 120, label: 'Sin límite' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => set('tiempo_max', value)}
              className={`py-2 rounded-xl font-body text-xs font-medium transition-all duration-150 ${
                filtros.tiempo_max === value
                  ? 'bg-spice text-white'
                  : 'bg-cream text-muted hover:text-bark border border-bark/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
