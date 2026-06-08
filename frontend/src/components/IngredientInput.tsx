import { useState, useRef, KeyboardEvent } from 'react'
import { SUGERENCIAS } from '../types/recipe'

interface Props {
  ingredientes: string[]
  onChange: (ingredientes: string[]) => void
}

export function IngredientInput({ ingredientes, onChange }: Props) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const agregar = (valor: string) => {
    const limpio = valor.trim().toLowerCase()
    if (!limpio || ingredientes.includes(limpio)) return
    onChange([...ingredientes, limpio])
    setInput('')
  }

  const quitar = (ing: string) => onChange(ingredientes.filter((i) => i !== ing))

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      agregar(input)
    }
    if (e.key === 'Backspace' && !input && ingredientes.length) {
      quitar(ingredientes[ingredientes.length - 1])
    }
  }

  const sugerenciasDisponibles = SUGERENCIAS.filter((s) => !ingredientes.includes(s)).slice(0, 10)

  return (
    <div>
      {/* Input area */}
      <div
        className="min-h-14 flex flex-wrap gap-2 items-center px-4 py-3 bg-white border-2 border-cream rounded-2xl cursor-text focus-within:border-gold transition-colors"
        onClick={() => inputRef.current?.focus()}
      >
        {ingredientes.map((ing) => (
          <span
            key={ing}
            className="flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/30 text-bark rounded-full font-body text-sm font-medium animate-fade-in"
          >
            {ing}
            <button
              onClick={(e) => { e.stopPropagation(); quitar(ing) }}
              className="w-4 h-4 rounded-full bg-gold/20 hover:bg-spice/20 text-muted hover:text-spice flex items-center justify-center transition-colors text-xs font-bold"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => input && agregar(input)}
          placeholder={ingredientes.length === 0 ? 'Escribí un ingrediente y presioná Enter...' : ''}
          className="flex-1 min-w-32 outline-none bg-transparent font-body text-bark placeholder:text-muted/50 text-sm"
        />
      </div>

      {/* Sugerencias rápidas */}
      {sugerenciasDisponibles.length > 0 && (
        <div className="mt-3">
          <p className="font-body text-xs text-muted mb-2">Sugerencias rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {sugerenciasDisponibles.map((s) => (
              <button
                key={s}
                onClick={() => agregar(s)}
                className="px-3 py-1 bg-cream border border-bark/10 text-muted hover:text-bark hover:border-gold/40 hover:bg-gold/5 rounded-full font-body text-xs transition-all duration-150"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
