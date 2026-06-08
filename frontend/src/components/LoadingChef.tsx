const frases = [
  'Revisando la heladera virtual...',
  'Consultando al chef con IA...',
  'Combinando sabores...',
  'Calculando tiempos de cocción...',
  'Casi listo, paciencia...',
]

export function LoadingChef() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5">
      <div className="text-6xl animate-bounce-sm">🍳</div>
      <div className="text-center">
        <p className="font-display text-bark font-bold text-xl mb-1">Cocinando con IA...</p>
        <p className="font-body text-muted text-sm">{frases[Math.floor(Math.random() * frases.length)]}</p>
      </div>
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-gold animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
