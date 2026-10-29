import { Icon } from './Icon'

export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={`brand ${compact ? 'brand-compact' : ''}`}>
    <span className="icon-plate brand-symbol"><Icon name="team" /></span>
    <div><span className="brand-name">TeamVal<span className="brand-dot" /></span>
      {!compact && <p>Juega en equipo. Llega más lejos.</p>}
    </div>
  </div>
}
