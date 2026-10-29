import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { currentPlayerId, type RequestStatus, type Result } from '../../domain/models/community'
import { communityErrors } from '../../shared/i18n/community'
import { useCommunity } from '../../app/community-context'
import { PageHeading } from '../../shared/ui/PageHeading'
import { Icon } from '../../shared/ui/Icon'
import { Avatar } from '../../shared/ui/Avatar'
import { DemoNotice, EmptyState, ErrorState, LoadingState } from '../../shared/ui/StateViews'

const statusText: Record<RequestStatus, string> = { Pending: 'Solicitud pendiente', Accepted: 'Solicitud aceptada', Rejected: 'Solicitud rechazada' }

export function StackRequestsPage() {
  const { state, repository, profileOf, retry } = useCommunity()
  const [params] = useSearchParams()
  const postId = params.get('publicacion')
  const [sentOnly, setSentOnly] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  async function resolve(requestId: string, accept: boolean) {
    setBusyId(requestId); setMessage(null)
    const result: Result<string> = await repository.resolve(requestId, accept)
    setBusyId(null)
    setMessage(result.ok
      ? { tone: 'success', text: accept ? 'Solicitud aceptada. Un nuevo compañero ocupa una plaza.' : 'Solicitud rechazada. No se ha ocupado ninguna plaza.' }
      : { tone: 'error', text: communityErrors[result.error] })
  }

  async function simulate(targetPostId: string) {
    setBusyId(targetPostId); setMessage(null)
    const result = await repository.simulate(targetPostId)
    setBusyId(null)
    setMessage(result.ok
      ? { tone: 'success', text: 'Ha llegado una solicitud ficticia. Ya aparece más abajo.' }
      : { tone: 'error', text: communityErrors[result.error] })
  }

  const header = <Link to="/app/buscar-equipo" className="back-link"><Icon name="back" />Volver a Buscar equipo</Link>

  if (state.status === 'loading') return <div className="requests-page space-y-6">{header}<LoadingState label="Cargando solicitudes…" /></div>
  if (state.status === 'error') return <div className="requests-page space-y-6">{header}<ErrorState message={communityErrors.Storage} onRetry={retry} /></div>

  const snapshot = state.data
  const selectedPost = postId ? snapshot.posts.find((post) => post.id === postId) : undefined
  if (postId && !selectedPost) return <div className="requests-page space-y-6">{header}<EmptyState title="No encontramos esa publicación" description="Puede que se haya reiniciado la demo local. Vuelve a Buscar equipo para ver las publicaciones actuales."><Link className="button button-primary" to="/app/buscar-equipo">Ver publicaciones</Link></EmptyState></div>

  const sent = selectedPost ? selectedPost.ownerId !== currentPlayerId : sentOnly
  const ownSelectedPost = selectedPost?.ownerId === currentPlayerId
  const requests = snapshot.requests.filter((request) => {
    const post = snapshot.posts.find((candidate) => candidate.id === request.postId)
    if (!post) return false
    if (selectedPost) return request.postId === selectedPost.id && (sent ? request.applicantId === currentPlayerId : post.ownerId === currentPlayerId)
    return sent ? request.applicantId === currentPlayerId : post.ownerId === currentPlayerId
  })
  const pendingInSelected = selectedPost ? snapshot.requests.filter((request) => request.postId === selectedPost.id && request.status === 'Pending').length : 0

  return <div className="requests-page space-y-6">
    {header}
    <PageHeading title="Solicitudes" description={selectedPost ? selectedPost.title : 'Gestiona tu equipo y consulta tus solicitudes para unirte.'} />

    <div className="scope-row" role="group" aria-label="Tipo de solicitud">
      {!selectedPost && <>
        <button type="button" className="chip chip-toggle" aria-pressed={!sent} onClick={() => setSentOnly(false)}>Recibidas</button>
        <button type="button" className="chip chip-toggle" aria-pressed={sent} onClick={() => setSentOnly(true)}>Enviadas</button>
      </>}
      <span className="badge demo-inline">DEMO LOCAL</span>
    </div>

    <DemoNotice>{sent
      ? 'Solicitudes enviadas a anfitriones ficticios. En esta demo quedan pendientes; puedes practicar las decisiones en Recibidas.'
      : 'Candidatos ficticios para tus publicaciones. Aceptar ocupa una plaza; rechazar mantiene el cupo disponible.'}</DemoNotice>

    {message && <div role={message.tone === 'error' ? 'alert' : 'status'} className={`notice action-notice ${message.tone === 'error' ? 'notice-error' : 'notice-success'}`}>
      <Icon name={message.tone === 'error' ? 'info' : 'check'} /><p>{message.text}</p>
      <button type="button" className="notice-dismiss" aria-label="Cerrar mensaje" onClick={() => setMessage(null)}><Icon name="close" /></button>
    </div>}

    {selectedPost && ownSelectedPost && <div className="simulate-bar">
      <button type="button" className="button button-secondary" onClick={() => void simulate(selectedPost.id)} disabled={busyId === selectedPost.id || selectedPost.memberIds.length >= selectedPost.capacity}>
        <Icon name="plus" />{busyId === selectedPost.id ? 'Simulando…' : 'Simular solicitud'}
      </button>
      <span className="field-hint">{pendingInSelected} {pendingInSelected === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'} en esta publicación.</span>
    </div>}

    {requests.length === 0
      ? <EmptyState title="Todavía no hay solicitudes" description={sent
          ? 'Explora los stacks y solicita unirte a uno con plazas disponibles.'
          : 'Usa «Simular solicitud» en una de tus publicaciones para recibir un candidato ficticio.'}>
          <Link className="button button-primary" to="/app/buscar-equipo">{sent ? 'Explorar publicaciones' : 'Ver mis publicaciones'}</Link>
        </EmptyState>
      : <div className="request-list">
          {requests.map((request) => {
            const post = snapshot.posts.find((candidate) => candidate.id === request.postId)!
            const applicant = profileOf(request.applicantId)
            const owner = profileOf(post.ownerId)
            const canManage = post.ownerId === currentPlayerId && request.status === 'Pending'
            return <article className="glass request-card" key={request.id}>
              <div className="request-person">
                {applicant && <Avatar profile={applicant} size="md" link />}
                <div>
                  <p className="stack-host">{sent ? 'Anfitrión' : 'Solicitante'}</p>
                  <h3>{sent ? owner?.name ?? 'Jugador' : applicant?.name ?? 'Jugador'}</h3>
                  <p className="request-post">en <Link to={`/app/buscar-equipo/publicaciones/${post.id}`}>{post.title}</Link></p>
                </div>
              </div>
              <span className={`status-pill status-${request.status.toLowerCase()}`}>{statusText[request.status]}</span>
              {canManage && <div className="request-actions">
                <button type="button" className="button button-primary" onClick={() => void resolve(request.id, true)} disabled={busyId === request.id}><Icon name="check" />Aceptar</button>
                <button type="button" className="button button-secondary" onClick={() => void resolve(request.id, false)} disabled={busyId === request.id}><Icon name="close" />Rechazar</button>
              </div>}
              {request.status === 'Pending' && !canManage && <p className="field-hint"><Icon name="clock" className="inline-icon" />Pendiente de decisión del anfitrión.</p>}
            </article>
          })}
        </div>}
  </div>
}
