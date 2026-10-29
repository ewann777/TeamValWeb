import { Link } from 'react-router-dom'
import type { PlayerProfile } from '../../domain/models/community'

const backgroundGradients: Record<PlayerProfile['background'], string> = {
  Nebula: '#3B1E63,#171033',
  Ocean: '#1D4E68,#101F2E',
  Sunset: '#783E50,#302132',
  Graphite: '#3B3B43,#19191E',
}

interface Props {
  profile: PlayerProfile
  size?: 'sm' | 'md' | 'lg'
  /** El enlace existe solo donde pulsar el avatar debe abrir el perfil público. */
  link?: boolean
  className?: string
}

/**
 * Avatar decorativo: el texto alternativo vive en el enlace contenedor
 * (`link`) o en la etiqueta del botón que lo incluye.
 */
export function Avatar({ profile, size = 'md', link = false, className = '' }: Props) {
  const initials = profile.name.trim().slice(0, 2).toUpperCase() || '??'
  const art = <span
    className={`avatar avatar-${size} frame-${profile.frame} ${className}`}
    style={{ background: `linear-gradient(145deg, ${backgroundGradients[profile.background]})` }}
    aria-hidden="true"
  ><span className="avatar-initials">{initials}</span><span className="avatar-glyph" /></span>
  if (!link) return art
  return <Link to={`/app/jugadores/${profile.id}`} className="avatar-link" aria-label={`Ver el perfil público de ${profile.name}`}>{art}</Link>
}
