import { useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { destinations, pageTitle } from '../navigation'
import { Brand } from '../../shared/ui/Brand'
import { Icon } from '../../shared/ui/Icon'
import { AppBackground } from '../../shared/theme/AppBackground'
import { useAppearance } from '../../shared/theme/appearance-context'

export function AppLayout() {
  const { effective, warning } = useAppearance()
  const { pathname } = useLocation()
  const main = useRef<HTMLElement>(null)
  const lastPath = useRef(pathname)
  const title = pageTitle(pathname)
  useEffect(() => {
    document.title = `TeamVal · ${title}`
    if (lastPath.current !== pathname) {
      main.current?.focus({ preventScroll: true })
      window.scrollTo({ top: 0, behavior: 'instant' })
      lastPath.current = pathname
    }
  }, [pathname, title])
  return <>
    <AppBackground style={effective.background} className="global-background" />
    <a href="#contenido" className="skip-link">Saltar al contenido</a>
    <aside className="sidebar">
      <Link to="/app" className="brand-link" aria-label="TeamVal · Inicio"><Brand compact /></Link>
      <p className="sidebar-caption">TU ESPACIO DE JUEGO</p>
      <nav aria-label="Navegación principal" className="desktop-nav">
        {destinations.map((item) => <NavLink end={item.to === '/app'} key={item.to} to={item.to} className="nav-item"><Icon name={item.icon} /><span>{item.label}</span><span className="nav-active-dot" /></NavLink>)}
      </nav>
      <div className="sidebar-bottom">
        <NavLink to="/app/apariencia" className="nav-item"><Icon name="palette" /><span>Apariencia</span></NavLink>
        <div className="sidebar-note"><span className="badge">VERSIÓN WEB · W3</span><p>El mismo equipo.<br />Una nueva forma de conectar.</p></div>
      </div>
    </aside>
    <div className="app-shell">
      <header className="topbar"><span className="breadcrumb">TeamVal <span>/</span> <strong>{title}</strong></span><div className="flex items-center gap-3"><span className="local-label">Vista previa local</span><Link className="icon-button" to="/app/apariencia" aria-label="Apariencia de la aplicación"><Icon name="palette" /></Link></div></header>
      <main id="contenido" tabIndex={-1} ref={main} className="main-content">
        {warning && <div role="status" className="notice mb-6"><Icon name="info" /><p>{warning}</p></div>}
        <div key={pathname.startsWith('/app/scrims') ? '/app/scrims' : pathname} className="page-enter"><Outlet /></div>
      </main>
      <footer className="app-footer">
        <div className="footer-row">
          <span>TeamVal <span className="footer-dot">·</span> Hecho para jugar en equipo.</span>
          <nav aria-label="Enlaces legales" className="footer-links">
            <Link to="/privacidad">Privacidad</Link>
            <span className="footer-dot" aria-hidden="true">·</span>
            <Link to="/terminos">Términos</Link>
          </nav>
        </div>
        <div className="footer-legal">
          <p className="footer-disclaimer">TeamVal es un proyecto independiente y no está afiliado, patrocinado ni respaldado por Riot Games. VALORANT y sus marcas pertenecen a Riot Games.</p>
          <p className="footer-disclaimer footer-disclaimer-official">TeamVal isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.</p>
        </div>
      </footer>
    </div>
    <nav className="mobile-nav" aria-label="Navegación móvil">
      {destinations.map((item) => <NavLink end={item.to === '/app'} key={item.to} to={item.to}><span className="mobile-icon"><Icon name={item.icon} /></span><span>{item.label}</span></NavLink>)}
    </nav>
  </>
}
