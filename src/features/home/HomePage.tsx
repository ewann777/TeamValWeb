import { Link } from 'react-router-dom'
import { Brand } from '../../shared/ui/Brand'
import { Icon } from '../../shared/ui/Icon'
import { FeatureCard } from '../../shared/ui/FeatureCard'
import { homeText as text } from '../../shared/i18n/es'
import { labels } from '../../shared/i18n/community'
import { categoryOf, slotsAvailable, currentPlayerId } from '../../domain/models/community'
import { useCommunity } from '../../app/community-context'
import { Avatar } from '../../shared/ui/Avatar'
import { DemoNotice, ErrorState, LoadingState } from '../../shared/ui/StateViews'

export function HomePage() {
  const { state, me, profileOf, retry } = useCommunity()

  const summary = (() => {
    if (state.status === 'loading') return <LoadingState label="Cargando tu resumen…" />
    if (state.status === 'error') return <ErrorState message="No se pudieron leer los datos locales de demostración." onRetry={retry} />
    const featured = state.data.posts.filter((post) => post.ownerId !== currentPlayerId).slice(0, 2)
    const myPosts = state.data.posts.filter((post) => post.ownerId === currentPlayerId).length
    const pending = state.data.requests.filter((request) => request.status === 'Pending' && state.data.posts.find((post) => post.id === request.postId)?.ownerId === currentPlayerId).length
    return <>
      <section aria-labelledby="destacadas" className="space-y-4">
        <div className="section-heading section-heading-row">
          <div><h2 id="destacadas">Publicaciones destacadas</h2><p>Grupos de demostración que buscan compañeros ahora mismo.</p></div>
          <span className="badge demo-inline">DEMO LOCAL</span>
        </div>
        <div className="featured-grid">
          {featured.map((post) => {
            const owner = profileOf(post.ownerId)
            const slots = slotsAvailable(post)
            return <Link key={post.id} to={`/app/buscar-equipo/publicaciones/${post.id}`} className="glass featured-card">
              <div className="featured-top">
                <span className="chip">{labels[categoryOf(post.capacity)]}</span>
                <span className="field-hint">{slots > 0 ? `${slots} ${slots === 1 ? 'cupo' : 'cupos'} libres` : 'Completo'}</span>
              </div>
              <h3>{post.title}</h3>
              <div className="featured-meta">
                {owner && <Avatar profile={owner} size="sm" />}
                <span>{owner?.name}</span>
                <span className="featured-dot">·</span>
                <span>{labels[post.region]}</span>
                <span className="featured-dot">·</span>
                <span>{labels[post.rank]}</span>
              </div>
              <div className="featured-foot">
                <span>Integrantes: {post.memberIds.length} de {post.capacity}</span>
                <span className="featured-cta">Ver publicación<Icon name="arrow" /></span>
              </div>
            </Link>
          })}
        </div>
        <p className="home-footer"><Link to="/app/buscar-equipo" className="text-link">Ver todas las publicaciones<Icon name="arrow" className="inline-icon" /></Link></p>
      </section>

      {me && <section className="glass home-summary" aria-labelledby="mi-espacio">
        <div className="home-summary-id">
          <Avatar profile={me} size="md" link />
          <div>
            <p className="eyebrow"><span className="small-dot" />TU ESPACIO</p>
            <h2 id="mi-espacio">{me.name}</h2>
            <p className="field-hint">{me.riotId} · {labels[me.region]} · Main {me.agent}</p>
          </div>
        </div>
        <div className="summary-stats summary-compact">
          <div><strong>{myPosts}</strong><span>Mis publicaciones</span></div>
          <div><strong>{pending}</strong><span>Solicitudes pendientes</span></div>
        </div>
        <div className="home-summary-actions">
          <Link className="button button-primary" to="/app/perfil"><Icon name="profile" />Ver mi perfil</Link>
          <Link className="button button-secondary" to="/app/buscar-equipo/crear"><Icon name="plus" />Crear publicación</Link>
        </div>
      </section>}
    </>
  })()

  return <div className="home-page space-y-7">
    <div className="home-brand-row"><Brand /><span className="badge web-badge">ANDROID → WEB</span></div>

    {summary}

    <section className="welcome-card">
      <div className="hero-orb hero-orb-one" aria-hidden="true" /><div className="hero-orb hero-orb-two" aria-hidden="true" />
      <div className="hero-content"><p className="eyebrow"><span className="small-dot" />{text.eyebrow}</p><h1>{text.title}</h1><p className="hero-description">{text.description}</p>
        <Link to="/app/buscar-equipo" className="button button-primary">{text.action}<Icon name="arrow" /></Link>
        <p className="hero-stage">Demo local · perfiles y publicaciones ficticios en tu navegador.</p>
      </div>
      <div className="hero-emblem" aria-hidden="true"><div className="emblem-ring"><Icon name="team" /></div><span>JUNTOS, MÁS LEJOS.</span></div>
    </section>

    <DemoNotice>Esta versión web aún no tiene backend: todo lo que guardes se queda en este navegador.</DemoNotice>

    <section aria-labelledby="explora"><div className="section-heading"><h2 id="explora">{text.explore}</h2><p>{text.exploreDescription}</p></div>
      <div className="feature-list">
        <FeatureCard title="Buscar equipo" description="Busca compañeros por dúo, trío o stack, publica tu grupo y conecta con otros jugadores." to="/app/buscar-equipo" icon="team" />
        <FeatureCard title="Scrims" description="Un espacio para los próximos desafíos de tu equipo." to="/app/scrims" icon="scrims" stage="W4" />
        <FeatureCard title="Tienda" description="Descubre cosméticos y nuevas formas de personalizar tu estilo." to="/app/tienda" icon="shop" stage="W5" />
      </div>
    </section>
    <Link to="/app/apariencia" className="appearance-callout"><span className="icon-plate small"><Icon name="palette" /></span><div><h2>Haz TeamVal tuyo.</h2><p>Elige tus colores, tu tema y tu fondo.</p></div><Icon name="arrow" /></Link>
    <p className="home-footer">{text.footer}</p>
  </div>
}
