import { ImageOff, UtensilsCrossed } from 'lucide-react'
import { useRecipeImage } from '../hooks/useRecipeImage'

interface Props {
  recipeName: string
  imageQuery?: string
  ingredientesUsados?: string[]
  className?: string
}

export function RecipeImage({ recipeName, imageQuery, ingredientesUsados, className = '' }: Props) {
  const { imageUrl, isLoading } = useRecipeImage(imageQuery, recipeName, ingredientesUsados)

  if (isLoading) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-gold/20 via-cream to-herb/10 ${className}`}>
        <div className="absolute inset-0 animate-pulse bg-bark/5" />
        <div className="absolute inset-0 flex items-center justify-center">
          <UtensilsCrossed className="w-10 h-10 text-gold/40" strokeWidth={1.5} />
        </div>
      </div>
    )
  }

  if (!imageUrl) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-gold/25 via-cream to-bark/5 ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted/60">
          <ImageOff className="w-8 h-8" strokeWidth={1.5} />
          <span className="font-body text-xs">FoodAlchemy</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={imageUrl}
        alt={recipeName}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bark/50 via-transparent to-transparent" />
    </div>
  )
}
