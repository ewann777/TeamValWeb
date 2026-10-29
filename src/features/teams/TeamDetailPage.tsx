import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ratingCategories, teamOf } from '../../domain/models/teams'
import { teamLabels } from '../../shared/i18n/teams'
import { PageHeading } from '../../shared/ui/PageHeading'
import { EmptyState } from '../../shared/ui/StateViews'
import { useTeams } from './use-teams'
import { TeamIdentityView } from './TeamIdentityView'

export function TeamDetailPage() {
  const { id } = useParams(), { data, actor, players, act, busy } = useTeams()
  const [candidate, setCandidate] = useState('')
  const team = data.teams.find((t) => t.id === id)
  if (!team) return <EmptyState title="Este equipo no existe" description="Vuelve al explorador para ver las plantillas disponibles." ><Link to="/app/scrims/equipos" className="button button-secondary">Ver equipos</Link></EmptyState>
  const captain = team.captain === actor
  const ratings = data.ratings.filter((r) => r.to === id)
  const average = ratings.length ? ratings.reduce((sum, r) => sum + ratingCategories.reduce((n, k) => n + r.scores[k], 0), 0) / (ratings.length * 5) : null
  const freePlayers = players.filter((p) => !teamOf(data, p.id))
  return <>
    <PageHeading title={team.name} description="Perfil público de equipo · demostración local." />
    <TeamIdentityView team={team} players={players} />
    <div className="chip-row">
      {captain && <Link className="button button-primary" to={`/app/scrims/equipos/${id}/editar`}>Editar equipo</Link>}
      {!teamOf(data, actor) && <button className="button button-primary" disabled={busy || team.members.length >= 7 || data.memberships.some((r) => r.team === id && r.player === actor && r.status === 'Pending')} onClick={() => void act({ type: 'membership', team: team.id, player: actor, kind: 'Join' }, 'Solicitud de ingreso enviada en la demo.')}>Solicitar ingreso</button>}
      {team.members.includes(actor) && !captain && <button className="button button-secondary" disabled={busy} onClick={() => { if (window.confirm('¿Salir de este equipo demo?')) void act({ type: 'member', team: team.id, player: actor, action: 'leave' }) }}>Salir del equipo</button>}
    </div>
    {captain && <section className="glass form-card"><h2>Gestionar plantilla</h2><p className="field-hint">Hasta 7 integrantes, un equipo por jugador. Transferir capitanía cede los permisos de gestión.</p>
      <div className="form-grid"><label className="field"><span className="field-label">Jugador para invitar</span><select value={candidate} onChange={(e) => setCandidate(e.target.value)}><option value="">Selecciona un jugador demo</option>{freePlayers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><button className="button button-primary" disabled={busy || !candidate || team.members.length >= 7} onClick={() => void act({ type: 'membership', team: team.id, player: candidate, kind: 'Invite' }, 'Invitación local enviada. Cambia al jugador invitado para responder.')}>Invitar jugador</button></div>
      <ul className="w4-list">{team.members.filter((p) => p !== actor).map((p) => <li key={p}><Link to={`/app/jugadores/${p}`}>{players.find((v) => v.id === p)?.name ?? p}</Link><div className="chip-row"><button className="button button-secondary" disabled={busy} onClick={() => { if (window.confirm('¿Transferir la capitanía a este jugador? Perderás tus permisos de capitán.')) void act({ type: 'member', team: team.id, player: p, action: 'captain' }) }}>Hacer capitán</button><button className="button button-secondary" disabled={busy} onClick={() => { if (window.confirm('¿Retirar a este integrante?')) void act({ type: 'member', team: team.id, player: p, action: 'remove' }) }}>Retirar integrante</button></div></li>)}</ul>
    </section>}
    <section className="glass form-card"><h2>Reputación demo</h2>
      {average === null ? <p>Aún no hay valoraciones recibidas. Se habilitan después de una scrim completada.</p> : <><p>{average.toFixed(1)}/5 · {ratings.length} valoraciones de conducta, no de nivel competitivo.</p><div className="chip-row">{ratingCategories.map((k) => <span className="chip" key={k}>{teamLabels[k]}: {(ratings.reduce((n, r) => n + r.scores[k], 0) / ratings.length).toFixed(1)}/5</span>)}</div><p>{ratings.filter((r) => r.toxic).length} valoraciones señalan comportamiento tóxico (demo, no verificado).</p></>}
      <ul className="w4-list">{ratings.map((r) => <li key={r.id}><div><Link to={`/app/scrims/equipos/${r.from}`}>{data.teams.find((t) => t.id === r.from)?.name}</Link><p className="field-hint">{new Date(r.date).toLocaleString('es')} · scrim demo</p><p>{r.comment || 'Sin comentario.'}</p><p>Comportamiento tóxico: {r.toxic ? 'Señalado' : 'No señalado'}</p><div className="chip-row">{ratingCategories.map((k) => <span className="chip" key={k}>{teamLabels[k]} {r.scores[k]}/5</span>)}</div></div>{captain && <button className="button button-secondary" disabled={busy || r.reports.includes(team.id)} onClick={() => void act({ type: 'report', rating: r.id }, 'Denuncia registrada solo en este navegador. No se envió a moderadores.')}>{r.reports.includes(team.id) ? 'Denuncia local registrada' : 'Denunciar localmente'}</button>}</li>)}</ul>
    </section>
  </>
}
