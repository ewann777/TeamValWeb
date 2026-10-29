import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { currentPlayerId, type Result } from '../../domain/models/community'
import { communityErrors, labels } from '../../shared/i18n/community'
import { useCommunity } from '../../app/community-context'
import { PageHeading } from '../../shared/ui/PageHeading'
import { Icon } from '../../shared/ui/Icon'
import { Avatar } from '../../shared/ui/Avatar'
import { DemoNotice, EmptyState, ErrorState, LoadingState } from '../../shared/ui/StateViews'
import { StackPostCard } from './StackPostCard'

export function StackDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, repository, profileOf, retry } = useCommunity()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  async function join(postId: string) {
    setBusy(true); setMessage(null)
    const result: Result<string> = await repository.join(postId)
    setBusy(false)
    setMessage(result.ok
      ? { tone: 'success', text: 'Solicitud enviada. Puedes consultarla en Solicitudes → Enviadas.' }
      : { tone: 'error', text: communityErrors[result.error] })
  }

  const back = <Link to="/app/buscar-equipo" className="back-link"><Icon name="back" />Volver a Buscar equipo</Link>
  if (state.status === 'loading') return <div className="space-y-6">{back}<LoadingState label="Cargando la publicación…" /></div>
  if (state.status === 'error') return <div className="space-y-6">{back}<ErrorState message={communityErrors.Storage} onRetry={retry} /></div>

  const snapshot = state.data
  const post = snapshot.posts.find((candidate) => candidate.id === id)
  if (!post) return <div className="space-y-6">{back}<EmptyState title="No encontramos esta publicación" description="Puede que la demo local se haya reiniciado o que el enlace ya no exista."><Link className="button button-primary" to="/app/buscar-equipo">Ver todas las publicaciones</Link></EmptyState></div>

  const owner = profileOf(post.ownerId)
  const members = post.memberIds.map((memberId) => profileOf(memberId)).filter((profile) => profile !== undefined)
  const isOwner = post.ownerId === currentPlayerId

  return <div className="detail-page space-y-6">
    {back}
    <PageHeading title={post.title} description={owner ? `Organiza ${owner.name} · ${labels[post.region]} · ${labels[post.mode]}` : 'Publicación de demostración'} />
    <DemoNotice>Publicación ficticia guardada en este navegador. Los perfiles y las solicitudes son datos de demostración.</DemoNotice>
    {message && <div role={message.tone === 'error' ? 'alert' : 'status'} className={`notice action-notice ${message.tone === 'error' ? 'notice-error' : 'notice-success'}`}>
      <Icon name={message.tone === 'error' ? 'info' : 'check'} /><p>{message.text}</p>
    </div>}
    <div className="detail-grid">
      <StackPostCard
        post={post}
        owner={owner}
        members={members}
        isOwner={isOwner}
        isMember={post.memberIds.includes(currentPlayerId)}
        requestStatus={snapshot.requests.find((request) => request.postId === post.id && request.applicantId === currentPlayerId)?.status}
        pendingCount={snapshot.requests.filter((request) => request.postId === post.id && request.status === 'Pending').length}
        busy={busy}
        onJoin={() => void join(post.id)}
        onManage={() => navigate(`/app/buscar-equipo/solicitudes?publicacion=${post.id}`)}
      />
      <aside className="glass roster-panel" aria-label="Integrantes del grupo">
        <h2>Integrantes</h2>
        <ul className="roster-list">
          {members.map((member) => <li key={member.id}>
            <Avatar profile={member} size="md" link />
            <div><Link to={`/app/jugadores/${member.id}`}>{member.name}</Link><span>{labels[member.rank]}</span></div>
            {member.id === post.ownerId && <span className="badge">Anfitrión</span>}
          </li>)}
          {Array.from({ length: post.capacity - members.length }, (_, index) => <li key={`empty-${index}`} className="roster-empty">
            <span className="avatar avatar-md" aria-hidden="true"><Icon name="plus" /></span>
            <div><span>Cupo disponible</span><span>Libre para unirse</span></div>
          </li>)}
        </ul>
      </aside>
    </div>
  </div>
}
