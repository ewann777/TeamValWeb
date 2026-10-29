import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ranks, regions } from '../../domain/models/community'
import { divisions, teamOf } from '../../domain/models/teams'
import { labels } from '../../shared/i18n/community'
import { teamLabels } from '../../shared/i18n/teams'
import { PageHeading } from '../../shared/ui/PageHeading'
import { EmptyState } from '../../shared/ui/StateViews'
import { useTeams } from '../teams/use-teams'
import { TeamIdentityView } from '../teams/TeamIdentityView'

export function ScrimsPage() {
  const { data, actor, players, busy, act } = useTeams()
  const [region, setRegion] = useState(''), [rank, setRank] = useState(''), [division, setDivision] = useState(''), [tier, setTier] = useState(''), [date, setDate] = useState(''), [own, setOwn] = useState(false)
  const mine = teamOf(data, actor)
  const [now] = useState(() => Date.now())
  const posts = data.posts.filter((p) => (!own || p.team === mine?.id) && (!region || p.region === region) && (!rank || p.rank === rank) && (!division || p.division === division) && (!tier || p.tier === Number(tier)) && (!date || localDate(p.date) === date))
  return <>
    <PageHeading title="Scrims" description="Encuentra rival, coordina tu equipo y practica con respeto." />
    <div className="chip-row">{mine?.captain === actor ? <Link className="button button-primary" to="/app/scrims/publicar">Publicar búsqueda de rival</Link> : <p className="field-hint">Necesitas ser capitán para publicar o solicitar una scrim.</p>}{!mine && <Link className="button button-primary" to="/app/scrims/equipos/crear">Crear mi equipo</Link>}</div>
    <div className="glass form-card"><div className="form-grid">
      <label className="field"><span className="field-label">Región</span><select value={region} onChange={(e) => setRegion(e.target.value)}><option value="">Todas</option>{regions.map((v) => <option key={v} value={v}>{labels[v]}</option>)}</select></label>
      <label className="field"><span className="field-label">Rango</span><select value={rank} onChange={(e) => setRank(e.target.value)}><option value="">Todos</option>{ranks.map((v) => <option key={v} value={v}>{labels[v]}</option>)}</select></label>
      <label className="field"><span className="field-label">División Premier</span><select value={division} onChange={(e) => { setDivision(e.target.value); setTier('') }}><option value="">Todas</option>{divisions.map((v) => <option key={v}>{v}</option>)}</select></label>
      {division && !['Invite', 'Contender'].includes(division) && <label className="field"><span className="field-label">Grupo Premier</span><select value={tier} onChange={(e) => setTier(e.target.value)}><option value="">Todos</option>{[1, 2, 3, 4, 5].map((v) => <option key={v}>{v}</option>)}</select></label>}
      <label className="field"><span className="field-label">Fecha local</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
    </div><label><input type="checkbox" checked={own} onChange={(e) => setOwn(e.target.checked)} /> Mis publicaciones</label><button className="button button-secondary" onClick={() => { setRegion(''); setRank(''); setDivision(''); setTier(''); setDate(''); setOwn(false) }}>Limpiar filtros</button></div>
    <p className="field-hint">Horarios en tu zona: {Intl.DateTimeFormat().resolvedOptions().timeZone}. Divisiones declaradas, sin verificación de Premier.</p>
    <p role="status">{posts.length} publicaciones de scrims</p>
    {posts.length === 0 && <EmptyState title="Sin publicaciones con estos filtros" description="Limpia los filtros o publica tu búsqueda de rival." />}
    {posts.map((p) => { const team = data.teams.find((t) => t.id === p.team)!; const expired = Date.parse(p.date) <= now; return <article className="glass form-card scrim-post" key={p.id}>
      <h2>{team.name} — BUSCA SCRIM</h2><TeamIdentityView team={team} players={players} compact />
      <div className="chip-row"><span className="chip">{p.division}{['Contender', 'Invite'].includes(p.division) ? '' : ` ${p.tier}`}</span><span className="chip">{labels[p.region]}</span><span className="chip">{labels[p.rank]}</span><span className="chip">Mejor de {p.bestOf}</span><span className="badge">{p.status === 'Open' && expired ? 'Horario vencido' : teamLabels[p.status]}</span></div>
      <p><time dateTime={p.date}>{new Date(p.date).toLocaleString('es')}</time></p><p className="muted">{p.notes}</p>
      {mine?.id === p.team && mine.captain === actor ? <button className="button button-secondary" disabled={busy || p.status !== 'Open'} onClick={() => { if (window.confirm('¿Cerrar esta publicación y cancelar sus solicitudes pendientes?')) void act({ type: 'closePost', post: p.id }) }}>Cerrar publicación</button> : <button className="button button-primary" disabled={busy || !mine || mine.captain !== actor || p.status !== 'Open' || expired || data.scrims.some((r) => r.post === p.id && r.away === mine.id)} onClick={() => void act({ type: 'challenge', post: p.id }, 'Solicitud de scrim enviada. Cambia al capitán rival para responder en Agenda.')}>Solicitar scrim</button>}
    </article> })}
  </>
}
function localDate(iso: string) { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
