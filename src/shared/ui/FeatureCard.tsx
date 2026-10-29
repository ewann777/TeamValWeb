import { Link } from 'react-router-dom'
import { Icon, type IconName } from './Icon'

export function FeatureCard({ title, description, to, icon, stage }: { title: string; description: string; to: string; icon: IconName; stage?: string }) {
  return <Link to={to} className="glass feature-card group">
    <span className="icon-plate"><Icon name={icon} /></span>
    <div className="min-w-0 flex-1"><h3>{title}</h3><p>{description}</p>{stage && <span className="badge">Próximamente · {stage}</span>}</div>
    <Icon name="arrow" className="feature-arrow" />
  </Link>
}
