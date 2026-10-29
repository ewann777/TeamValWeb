import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../../shared/ui/Icon'
import { PageHeading } from '../../shared/ui/PageHeading'
import { FeatureCard } from '../../shared/ui/FeatureCard'

interface Props { title: string; description: string; icon: IconName; stage: string; planned: string[] }
export function UpcomingPage({ title, description, icon, stage, planned }: Props) {
  return <div className="space-y-7"><PageHeading title={title} description={description} />
    <section className="glass upcoming-card"><span className="icon-plate upcoming-icon"><Icon name={icon} /></span><span className="badge">PRÓXIMAMENTE · {stage}</span><h2>Lo mejor se construye<br className="hidden sm:block" /> en equipo.</h2><p>Estamos preparando esta sección para la web. Su funcionalidad llegará en la etapa {stage}; todavía no está disponible.</p>
      <div className="planned-list" aria-label="Funciones previstas">{planned.map((item) => <span key={item}><Icon name="lock" />{item}</span>)}</div>
      <Link to="/app" className="button button-primary"><Icon name="back" />Volver al inicio</Link>
    </section>
    {icon === 'profile' && <FeatureCard title="Apariencia de la aplicación" description="Colores, tema y fondo de TeamVal. Esta personalización ya está disponible." icon="palette" to="/app/apariencia" />}
    <p className="stage-note"><Icon name="info" />Esta versión permite revisar el diseño y la navegación. No hay cuentas ni usuarios conectados.</p>
  </div>
}
