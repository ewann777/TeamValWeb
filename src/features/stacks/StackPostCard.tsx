import { Link } from 'react-router-dom'
import { labels } from '../../shared/i18n/community'
import { categoryOf, slotsAvailable, type PlayerProfile, type RequestStatus, type StackPost } from '../../domain/models/community'
import { Avatar } from '../../shared/ui/Avatar'
import { Icon } from '../../shared/ui/Icon'

const FULL_TEAM = 5

interface Props {
  post: StackPost
  owner: PlayerProfile | undefined
  members: PlayerProfile[]
  isOwner: boolean
  isMember: boolean
  requestStatus?: RequestStatus
  pendingCount: number
  busy?: boolean
  onJoin?: () => void
  onManage?: () => void
  onSimulate?: () => void
}

/** Tarjeta de publicación con la semántica Android: cupos, plazas de 5 y decisiones. */
export function StackPostCard({ post, owner, members, isOwner, isMember, requestStatus, pendingCount, busy, onJoin, onManage, onSimulate }: Props) {
  const slots = slotsAvailable(post)
  const missing = Math.max(FULL_TEAM - post.capacity, 0)
  const legend = `Plazas de un equipo de 5: ${members.length} ocupadas por integrantes, ${slots} libres por cupos y ${missing} fuera de este grupo.`
  const requestLabel = requestStatus ? { Pending: 'Solicitud enviada', Accepted: 'Solicitud aceptada', Rejected: 'Solicitud rechazada' }[requestStatus] : null

  return <article className="glass stack-card">
    <div className="stack-card-top">
      <p className="stack-host">Organiza {owner ? <Link to={`/app/jugadores/${owner.id}`}>{owner.name}</Link> : 'Jugador desconocido'}</p>
      <span className="badge">{labels[categoryOf(post.capacity)]}</span>
    </div>
    <h3><Link to={`/app/buscar-equipo/publicaciones/${post.id}`}>{post.title}</Link></h3>
    <div className="chip-row">
      <span className="chip">{labels[post.rank]}</span>
      <span className="chip">{labels[post.region]}</span>
      <span className="chip">{labels[post.mode]}</span>
    </div>
    <p className="stack-description">{post.description}</p>

    <div className="stack-members-head">
      <strong>Integrantes: {members.length} de {post.capacity}</strong>
      <span className="stack-member-list">
        {members.map((member) => <Avatar key={member.id} profile={member} size="sm" link />)}
      </span>
    </div>
    <div className="roster" role="img" aria-label={legend}>
      {Array.from({ length: FULL_TEAM }, (_, index) => {
        const occupied = index < members.length
        const openSlot = !occupied && index < post.capacity
        return <span key={index} className={`roster-dot ${occupied ? 'occupied' : openSlot ? 'open' : 'outside'}`} />
      })}
    </div>
    <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={post.capacity} aria-valuenow={members.length} aria-label={`Ocupación del grupo: ${members.length} de ${post.capacity} plazas`}>
      <span style={{ width: `${(members.length / post.capacity) * 100}%` }} />
    </div>
    <p className="stack-coverage">
      {slots > 0 ? <strong className="stack-slots">{slots === 1 ? 'Falta 1 jugador' : `Faltan ${slots} jugadores`}</strong> : <strong className="stack-no-slots">Equipo completo</strong>}
      <span>{post.memberIds.length}/{post.capacity} jugadores · objetivo del grupo: {post.capacity}.</span>
    </p>

    <div className="stack-actions">
      {isOwner ? <>
        <button type="button" className="button button-primary" onClick={onManage} disabled={busy}>
          <Icon name="requests" />Gestionar solicitudes{pendingCount > 0 ? ` (${pendingCount} ${pendingCount === 1 ? 'pendiente' : 'pendientes'})` : ''}
        </button>
        <button type="button" className="button button-secondary" onClick={onSimulate} disabled={busy || slots === 0}>
          <Icon name="plus" />{busy ? 'Simulando…' : 'Simular solicitud'}
        </button>
        {slots === 0 && <p className="stack-hint"><Icon name="info" />Este grupo ya está completo. Puedes rechazar solicitudes pendientes.</p>}
      </> : <>
        <button type="button" className="button button-primary" onClick={onJoin} disabled={busy || Boolean(requestStatus) || isMember || slots === 0}>
          <Icon name={requestStatus || isMember || slots === 0 ? 'check' : 'plus'} />
          {busy ? 'Enviando…' : requestLabel ?? (isMember ? 'Ya formas parte' : slots === 0 ? 'Stack completo' : 'Solicitar unirme')}
        </button>
        {requestStatus === 'Pending' && <p className="stack-hint"><Icon name="clock" />Consulta tu solicitud en Solicitudes → Enviadas.</p>}
      </>}
    </div>
  </article>
}
