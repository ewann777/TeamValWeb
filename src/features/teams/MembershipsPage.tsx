import { Link } from 'react-router-dom'
import { useTeams } from './use-teams'
import { teamLabels } from '../../shared/i18n/teams'
import { PageHeading } from '../../shared/ui/PageHeading'
import { EmptyState } from '../../shared/ui/StateViews'

export function MembershipsPage() {
  const { data, actor, players, act, busy } = useTeams()
  const requests = data.memberships.filter((r) => r.player === actor || data.teams.find((t) => t.id === r.team)?.captain === actor)
  return <><PageHeading title="Invitaciones e ingresos" description="Responde como destinatario o cancela tus envíos pendientes." />
    {!requests.length && <EmptyState title="Sin solicitudes todavía" description="Invita desde tu equipo o solicita ingreso desde un perfil público." />}
    {requests.map((r) => {
      const team = data.teams.find((t) => t.id === r.team)!
      const recipient = r.kind === 'Invite' ? r.player : team.captain
      const sender = r.kind === 'Invite' ? team.captain : r.player
      return <article className="glass form-card" key={r.id}><h2>{teamLabels[r.kind]} · {team.name}</h2><p><Link to={`/app/jugadores/${r.player}`}>{players.find((p) => p.id === r.player)?.name}</Link> · <Link to={`/app/scrims/equipos/${team.id}`}>Ver equipo</Link></p><span className="badge">{teamLabels[r.status]}</span>
        {r.status === 'Pending' && <div className="chip-row">{recipient === actor && <><button className="button button-primary" disabled={busy} onClick={() => void act({ type: 'decideMember', request: r.id, decision: 'Accepted' }, 'Ingreso aceptado. Plantilla actualizada.')}>Aceptar ingreso</button><button className="button button-secondary" disabled={busy} onClick={() => void act({ type: 'decideMember', request: r.id, decision: 'Rejected' }, 'Solicitud rechazada.')}>Rechazar ingreso</button></>}{sender === actor && <button className="button button-secondary" disabled={busy} onClick={() => void act({ type: 'decideMember', request: r.id, decision: 'Cancelled' }, 'Solicitud cancelada.')}>Cancelar solicitud</button>}</div>}
      </article>
    })}
  </>
}
