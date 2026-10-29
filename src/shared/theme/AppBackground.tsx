import { useId } from 'react'
import type { BackgroundStyle } from '../../domain/models/appearance'

// A bounded, static tile: shared by the application and its thumbnails.
const stars = Array.from({ length: 64 }, (_, i) => ({
  x: (i % 8) * 30 + 5 + ((i * 13) % 19),
  y: Math.floor(i / 8) * 30 + 4 + ((i * 17) % 21),
  r: i % 6 === 0 ? 1.4 : 0.7,
  opacity: i % 6 === 0 ? 0.8 : 0.35,
})).filter((_, i) => i % 3 !== 0)

export function AppBackground({ style, className = '' }: { style: BackgroundStyle; className?: string }) {
  const id = useId().replaceAll(':', '')
  return <div aria-hidden="true" className={`app-background background-${style} ${className}`} data-background={style}>
    {style === 'aurora' && <div className="aurora-layer" />}
    {style === 'stars' && <svg width="100%" height="100%" className="star-field">
      <defs><pattern id={id} width="240" height="240" patternUnits="userSpaceOnUse">
        {stars.map((star, i) => <circle key={i} cx={star.x} cy={star.y} r={star.r} opacity={star.opacity} />)}
      </pattern></defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>}
  </div>
}
