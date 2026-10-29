import { Link } from 'react-router-dom'
import type { Team, TeamIdentity } from '../../domain/models/teams'
import type { PlayerProfile } from '../../domain/models/community'
import { labels } from '../../shared/i18n/community'
import { Avatar } from '../../shared/ui/Avatar'

const glyphs = { Star: '✦', Bolt: 'ϟ', Diamond: '◇', Orbit: '◎' }
export function TeamLogo({ identity: i, name }: { identity: TeamIdentity; name: string }) {
  return <div className={`team-logo logo-${i.shape.toLowerCase()}`} style={{ background: i.background, borderColor: i.color }} role="img" aria-label={`Logo de ${name}`}>
    {i.image ? <img src={i.image} alt="" style={{ objectPosition: `${i.x}% ${i.y}%`, transform: `scale(${i.zoom})`, transformOrigin: `${i.x}% ${i.y}%` }} /> : <><span className="team-logo-symbol" style={{ color: i.color }} aria-hidden="true">{glyphs[i.symbol]}</span><strong>{i.letters}</strong></>}
  </div>
}
/** Shared by editor preview, public team page and scrim cards. */
export function TeamIdentityView({ team, players, compact = false }: { team: Team; players: PlayerProfile[]; compact?: boolean }) {
  return <section className={`glass team-identity banner-${team.identity.banner.toLowerCase()} layout-${team.identity.layout.toLowerCase()}`} aria-label={`Equipo ${team.name}`}>
    <div className="team-heading"><TeamLogo identity={team.identity} name={team.name || 'tu equipo'} /><div><p className="field-hint">{team.tag} · EQUIPO DEMO</p><h2>{team.id === 'preview' ? team.name || 'Tu equipo' : <Link to={`/app/scrims/equipos/${team.id}`}>{team.name || 'Tu equipo'}</Link>}</h2><p>{team.motto}</p><div className="chip-row"><span className="chip">{labels[team.region]}</span><span className="chip">{labels[team.rank]} · declarado</span><span className="chip">{team.members.length}/7 integrantes</span></div></div></div>
    {!compact && <p className="muted">{team.description}</p>}
    <ul className={`team-roster members-${team.identity.members.toLowerCase()}`} aria-label="Integrantes">
      {team.members.map((id) => { const p = players.find((p) => p.id === id); return <li key={id}>{p && <Avatar profile={p} size="sm" link />}<div><Link to={`/app/jugadores/${id}`}>{p?.name ?? id}</Link><span className="field-hint">{id === team.captain ? 'Capitán' : 'Integrante'}</span></div></li> })}
    </ul>
  </section>
}
