import { Navigate, Link, useParams } from 'react-router-dom'
import { currentPlayerId } from '../../domain/models/community'
import { communityErrors } from '../../shared/i18n/community'
import { useCommunity } from '../../app/community-context'
import { PageHeading } from '../../shared/ui/PageHeading'
import { Icon } from '../../shared/ui/Icon'
import { DemoNotice, EmptyState, ErrorState, LoadingState } from '../../shared/ui/StateViews'
import { ProfileCard } from './ProfileCard'

export function PublicProfilePage() {
  const { id } = useParams()
  const { state, profileOf, retry } = useCommunity()

  if (state.status === 'loading') return <div className="profile-page space-y-6"><LoadingState label="Cargando el perfil…" /></div>
  if (state.status === 'error') return <div className="profile-page space-y-6"><ErrorState message={communityErrors.Storage} onRetry={retry} /></div>
  if (!id || id === currentPlayerId) return <Navigate to="/app/perfil" replace />

  const profile = profileOf(id)
  if (!profile) return <div className="profile-page space-y-6">
    <Link to="/app/buscar-equipo" className="back-link"><Icon name="back" />Volver a Buscar equipo</Link>
    <EmptyState title="Este perfil no existe" description="Puede que la demo local se haya reiniciado o que el enlace sea incorrecto.">
      <Link className="button button-primary" to="/app">Volver al inicio</Link>
    </EmptyState>
  </div>

  const posts = state.status === 'ready' ? state.data.posts.filter((post) => post.ownerId === profile.id) : []

  return <div className="profile-page space-y-7">
    <Link to="/app/buscar-equipo" className="back-link"><Icon name="back" />Volver a Buscar equipo</Link>
    <PageHeading title={profile.name} description={`${profile.riotId} · perfil público de demostración`} />
    <DemoNotice>Perfil ficticio de la demo local. No hay cuentas ni usuarios reales conectados.</DemoNotice>

    <ProfileCard profile={profile} />

    <section className="glass settings-section" aria-labelledby="publicaciones-perfil">
      <div className="section-heading"><h2 id="publicaciones-perfil">Publicaciones de {profile.name}</h2></div>
      {posts.length === 0
        ? <p className="field-hint">Este jugador no tiene publicaciones activas ahora mismo.</p>
        : <ul className="profile-posts">
            {posts.map((post) => <li key={post.id}>
              <Link to={`/app/buscar-equipo/publicaciones/${post.id}`}>{post.title}</Link>
              <span className="field-hint">Integrantes: {post.memberIds.length} de {post.capacity}</span>
            </li>)}
          </ul>}
    </section>

    <section className="glass settings-section" aria-labelledby="stats-public">
      <div className="section-heading"><h2 id="stats-public">Estadísticas de VALORANT</h2></div>
      <div className="stats-unavailable">
        <span className="icon-plate state-icon"><Icon name="lock" /></span>
        <div><strong>No disponibles</strong><p>Esta demo no tiene conexión con Riot Games y no muestra cifras verificadas de ningún jugador.</p></div>
        <span className="badge">PRÓXIMAMENTE · RSO</span>
      </div>
    </section>
  </div>
}
