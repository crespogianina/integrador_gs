import { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react'
import { Info, X } from 'lucide-react'
import { SUGERENCIAS } from '../types/recipe'

interface Props {
  ingredientes: string[]
  onChange: (ingredientes: string[]) => void
}

function parseIngredientes(texto: string): string[] {
  return texto
    .split(/[,;\n]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export function IngredientInput({ ingredientes, onChange }: Props) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const agregarVarios = (valores: string[]) => {
    const nuevos = [...ingredientes]
    for (const v of valores) {
      const limpio = v.trim().toLowerCase()
      if (limpio && !nuevos.includes(limpio)) nuevos.push(limpio)
    }
    if (nuevos.length !== ingredientes.length) onChange(nuevos)
  }

  const agregar = (valor: string) => {
    agregarVarios([valor])
    setInput('')
  }

  const quitar = (ing: string) => onChange(ingredientes.filter((i) => i !== ing))

  const limpiarTodo = () => onChange([])

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (input.includes(',') || input.includes(';')) {
        agregarVarios(parseIngredientes(input))
        setInput('')
      } else {
        agregar(input)
      }
    }
    if (e.key === 'Backspace' && !input && ingredientes.length) {
      quitar(ingredientes[ingredientes.length - 1])
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const texto = e.clipboardData.getData('text')
    if (texto.includes(',') || texto.includes(';') || texto.includes('\n')) {
      e.preventDefault()
      agregarVarios(parseIngredientes(texto))
      setInput('')
    }
  }

  const sugerenciasDisponibles = SUGERENCIAS.filter((s) => !ingredientes.includes(s)).slice(0, 10)

  return (
    <div>
      <div
        className="min-h-14 flex flex-wrap gap-2 items-center px-4 py-3 bg-white dark:bg-bark/40 border-2 border-cream dark:border-cream/10 rounded-2xl cursor-text focus-within:border-gold transition-colors"
        onClick={() => inputRef.current?.focus()}
      >
        {ingredientes.map((ing) => (
          <span
            key={ing}
            className="flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/30 text-bark dark:text-cream rounded-full font-body text-sm font-medium animate-fade-in"
          >
            {ing}
            <button
              type="button"
              aria-label={`Quitar ${ing}`}
              onClick={(e) => {
                e.stopPropagation()
                quitar(ing)
              }}
              className="w-4 h-4 rounded-full bg-gold/20 hover:bg-spice/20 text-muted hover:text-spice flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3" strokeWidth={2.5} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          onPaste={handlePaste}
          onBlur={() => input && agregar(input)}
          placeholder={ingredientes.length === 0 ? 'Ej: tomate — Enter, coma o pegá varios' : 'Agregar otro...'}
          className="flex-1 min-w-32 outline-none bg-transparent font-body text-bark dark:text-cream placeholder:text-muted/50 text-sm"
          aria-label="Agregar ingrediente"
        />
      </div>

      <div className="mt-2 flex items-start justify-between gap-2">
        <p className="flex items-start gap-1.5 font-body text-xs text-muted dark:text-cream/50 flex-1">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" strokeWidth={2} />
          Un ingrediente por chip. Enter, coma, o pegá: tomate, cebolla, ajo
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          {ingredientes.length > 0 && (
            <>
              <span className="font-body text-xs text-muted dark:text-cream/50">
                {ingredientes.length} {ingredientes.length === 1 ? 'ingrediente' : 'ingredientes'}
              </span>
              <button
                type="button"
                onClick={limpiarTodo}
                className="font-body text-xs text-spice hover:underline"
              >
                Limpiar
              </button>
            </>
          )}
        </div>
      </div>

      {sugerenciasDisponibles.length > 0 && (
        <div className="mt-3">
          <p className="font-body text-xs text-muted dark:text-cream/50 mb-2">Sugerencias rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {sugerenciasDisponibles.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => agregar(s)}
                className="px-3 py-1 bg-cream dark:bg-bark/50 border border-bark/10 dark:border-cream/10 text-muted dark:text-cream/70 hover:text-bark dark:hover:text-cream hover:border-gold/40 hover:bg-gold/5 rounded-full font-body text-xs transition-all duration-150"
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
