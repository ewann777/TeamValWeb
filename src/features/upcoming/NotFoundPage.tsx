import { Link } from 'react-router-dom'
import { Icon } from '../../shared/ui/Icon'

export function NotFoundPage() {
  return <section className="glass upcoming-card"><span className="eyebrow">ERROR 404</span><h1>Esta ruta no está en el mapa.</h1><p>La página que buscas no existe. Vuelve a tu punto de encuentro.</p><Link to="/app" className="button button-primary"><Icon name="back" />Volver al inicio</Link></section>
}
