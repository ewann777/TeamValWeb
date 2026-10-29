import { useState } from 'react'
import { Link } from 'react-router-dom'
import { communityErrors } from '../../shared/i18n/community'
import { demoReputation } from '../../data/demo/community'
import { useCommunity } from '../../app/community-context'
import { PageHeading } from '../../shared/ui/PageHeading'
import { Icon } from '../../shared/ui/Icon'
import { DemoNotice, ErrorState, LoadingState } from '../../shared/ui/StateViews'
import { ProfileCard } from './ProfileCard'

export function ProfilePage() {
  const { state, repository, me, profileOf, retry } = useCommunity()
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  async function resetDemo() {
    const result = await repository.reset()
    setConfirming(false)
    setMessage(result.ok
      ? { tone: 'success', text: 'Datos de demostración restablecidos. Vuelve al inicio para ver el estado inicial.' }
      : { tone: 'error', text: communityErrors[result.error] })
  }

  if (state.status === 'loading') return <div className="profile-page space-y-6"><LoadingState label="Preparando tu espacio…" /></div>
  if (state.status === 'error' || !me) return <div className="profile-page space-y-6"><ErrorState message={communityErrors.Storage} onRetry={retry} /></div>

  const pending = state.data.requests.filter((request) => request.status === 'Pending' && state.data.posts.find((post) => post.id === request.postId)?.ownerId === me.id).length

  return <div className="profile-page space-y-7">
    <PageHeading title="Tu espacio, tu identidad" description="Tu ficha de jugador dentro de TeamVal."><span className="badge">TEAMVAL / PLAYER CARD</span></PageHeading>

    {message && <div role={message.tone === 'error' ? 'alert' : 'status'} className={`notice action-notice ${message.tone === 'error' ? 'notice-error' : 'notice-success'}`}>
      <Icon name={message.tone === 'error' ? 'info' : 'check'} /><p>{message.text}</p>
    </div>}

    <ProfileCard profile={me} own />

    <div className="profile-actions">
      <Link className="button button-primary" to="/app/perfil/editar"><Icon name="edit" />Editar perfil</Link>
      <Link className="button button-secondary" to="/app/apariencia"><Icon name="palette" />Apariencia de la aplicación</Link>
    </div>
    <p className="field-hint">Colores, tema y fondo de TeamVal. Los cambios se previsualizan antes de guardarlos.</p>

    <section className="glass settings-section" aria-labelledby="mis-datos">
      <div className="section-heading"><h2 id="mis-datos">Tu actividad de demostración</h2><p>Resumen local de lo que has hecho en esta sesión de navegador.</p></div>
      <div className="summary-stats">
        <div><strong>{state.data.posts.filter((post) => post.ownerId === me.id).length}</strong><span>Publicaciones tuyas</span></div>
        <div><strong>{pending}</strong><span>Solicitudes pendientes</span></div>
        <div><strong>{state.data.requests.filter((request) => request.applicantId === me.id).length}</strong><span>Solicitudes enviadas</span></div>
      </div>
      <DemoNotice>Todo vive en este navegador (clave <code>teamval.community.demo.v1</code>). No hay cuentas ni servidores.</DemoNotice>
    </section>

    <section className="glass settings-section" aria-labelledby="sobre-mi">
      <div className="section-heading"><h2 id="sobre-mi">Sobre mí</h2></div>
      <p className="profile-bio">{me.biography || 'Tu historia empieza aquí. Añade una biografía desde Editar perfil.'}</p>
      <p className="field-hint"><Icon name="info" className="inline-icon" />Tu Riot ID se muestra tal y como lo escribes: esta demo no verifica cuentas con Riot Games.</p>
    </section>

    <section className="glass settings-section" aria-labelledby="pulso">
      <div className="section-heading"><h2 id="pulso">Tu pulso en VALORANT</h2></div>
      <div className="stats-unavailable">
        <span className="icon-plate state-icon"><Icon name="lock" /></span>
        <div>
          <strong>Estadísticas no disponibles todavía</strong>
          <p>Partidas, victorias, K/D y headshots llegarán —si Riot autoriza la conexión— con Riot Sign On. No mostramos cifras inventadas ni datos verificados.</p>
        </div>
        <span className="badge">PRÓXIMAMENTE · RSO</span>
      </div>
    </section>

    <section className="glass settings-section" aria-labelledby="reputacion">
      <div className="section-heading"><h2 id="reputacion">La huella que dejas</h2></div>
      <DemoNotice>Reputación de demostración · valoraciones ficticias heredadas de la app Android. No son opiniones de jugadores reales.</DemoNotice>
      <div className="reputation-metrics">
        {[['Comunicación', demoReputation.communication], ['Trabajo en equipo', demoReputation.teamwork], ['Actitud', demoReputation.attitude]].map(([label, value]) => <div key={label as string} className="reputation-metric">
          <span>{label}</span>
          <div className="progress-track"><span style={{ width: `${value}%` }} /></div>
          <strong>{value}/100</strong>
        </div>)}
      </div>
      <ul className="review-list">
        {demoReputation.reviews.map((review, index) => {
          const author = profileOf(review.authorId)
          return <li key={index}>
            <span className="review-stars" role="img" aria-label={`Valoración: ${review.stars} de 5 estrellas`}>{Array.from({ length: 5 }, (_, star) => <Icon key={star} name="star" className={star < review.stars ? 'star-on' : 'star-off'} />)}</span>
            <p>«{review.comment}»</p>
            <span className="review-author">{author?.name ?? 'Jugador'} · demo</span>
          </li>
        })}
      </ul>
    </section>

    <section className="glass settings-section" aria-labelledby="reinicio">
      <div className="section-heading"><h2 id="reinicio">Reinicio de la demo</h2><p>Vuelve al estado inicial: publicaciones, solicitudes y perfil local.</p></div>
      {confirming ? <div className="confirm-row" role="alertdialog" aria-label="Confirmar reinicio">
        <p>Se descartarán tus cambios locales. ¿Continuar?</p>
        <div className="save-actions">
          <button type="button" className="button button-secondary" onClick={() => setConfirming(false)}>Cancelar</button>
          <button type="button" className="button button-primary" onClick={() => void resetDemo()}><Icon name="reset" />Sí, reiniciar</button>
        </div>
      </div> : <button type="button" className="reset-button" onClick={() => setConfirming(true)}><Icon name="reset" />Reiniciar datos de demostración</button>}
    </section>
  </div>
}
