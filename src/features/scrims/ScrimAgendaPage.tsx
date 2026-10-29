import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ratingCategories, teamOf, type Scores, type Scrim } from '../../domain/models/teams'
import { teamLabels } from '../../shared/i18n/teams'
import { PageHeading } from '../../shared/ui/PageHeading'
import { EmptyState } from '../../shared/ui/StateViews'
import { useTeams } from '../teams/use-teams'

export function ScrimAgendaPage() {
  const { data, actor } = useTeams()
  const [scope, setScope] = useState('Pending')
  const mine = teamOf(data, actor)
  const scrims = data.scrims.filter((r) => mine && [r.home, r.away].includes(mine.id) && (scope === 'History' ? ['Completed', 'Rejected', 'Cancelled'].includes(r.status) : r.status === scope))
  return <><PageHeading title="Agenda e historial" description="Solicitudes, enfrentamientos programados y resultados manuales de demostración." />
    <div className="chip-row" role="group" aria-label="Estado de scrims">{[['Pending', 'Pendientes'], ['Accepted', 'Programadas'], ['History', 'Historial']].map(([value, label]) => <button className="chip chip-toggle" key={value} aria-pressed={scope === value} onClick={() => setScope(value!)}>{label}</button>)}</div>
    {!scrims.length && <EmptyState title="Sin enfrentamientos en esta vista" description="Solicita una scrim desde el explorador o cambia de jugador demo para responder como rival." />}
    {scrims.map((r) => <ScrimCard key={r.id} scrim={r} />)}
  </>
}
function ScrimCard({ scrim: r }: { scrim: Scrim }) {
  const { data, actor, busy, act } = useTeams()
  const mine = teamOf(data, actor)!, captain = mine.captain === actor
  const p = data.posts.find((p) => p.id === r.post)!
  const [score, setScore] = useState(false), [rating, setRating] = useState(false)
  return <article className="glass form-card scrim-match"><h2><Link to={`/app/scrims/equipos/${r.home}`}>{data.teams.find((t) => t.id === r.home)?.name}</Link> vs <Link to={`/app/scrims/equipos/${r.away}`}>{data.teams.find((t) => t.id === r.away)?.name}</Link></h2>
    <p>{new Date(p.date).toLocaleString('es')} · Mejor de {p.bestOf}</p><span className="badge">{teamLabels[r.status]}</span>
    <div className="chip-row">
      {captain && r.status === 'Pending' && r.home === mine.id && <><button className="button button-primary" disabled={busy} onClick={() => void act({ type: 'decideScrim', scrim: r.id, decision: 'Accepted' }, 'Scrim aceptada. Disponible en Programadas.')}>Aceptar scrim</button><button className="button button-secondary" disabled={busy} onClick={() => void act({ type: 'decideScrim', scrim: r.id, decision: 'Rejected' }, 'Scrim rechazada.')}>Rechazar scrim</button></>}
      {captain && ['Pending', 'Accepted'].includes(r.status) && <button className="button button-secondary" disabled={busy} onClick={() => { if (window.confirm('¿Cancelar este enfrentamiento demo?')) void act({ type: 'decideScrim', scrim: r.id, decision: 'Cancelled' }, 'Scrim cancelada.') }}>Cancelar scrim</button>}
      {captain && r.status === 'Accepted' && <button className="button button-primary" onClick={() => setScore(!score)} aria-expanded={score}>Registrar resultado demo</button>}
    </div>
    {r.status === 'Accepted' && score && <ResultForm scrim={r} bestOf={p.bestOf} close={() => setScore(false)} />}
    {r.status === 'Completed' && <><p className="notice">{r.homeScore}–{r.awayScore} mapas · Resultado manual de demostración. No verificado por Riot. Puede registrarse anticipadamente para probar el flujo.</p>
      {data.ratings.some((v) => v.scrim === r.id && v.from === mine.id) ? <p>Tu equipo ya valoró esta scrim.</p> : captain && <button className="button button-primary" aria-expanded={rating} onClick={() => setRating(!rating)}>Valorar al rival</button>}
      {rating && !data.ratings.some((v) => v.scrim === r.id && v.from === mine.id) && <RatingForm scrim={r.id} close={() => setRating(false)} />}
    </>}
  </article>
}
function ResultForm({ scrim, bestOf, close }: { scrim: Scrim; bestOf: number; close: () => void }) {
  const { act, busy, data } = useTeams(), [home, setHome] = useState(''), [away, setAway] = useState('')
  async function save(e: FormEvent) { e.preventDefault(); if (await act({ type: 'complete', scrim: scrim.id, home: Number(home), away: Number(away) }, 'Resultado manual guardado. Consulta Historial para valorar.')) close() }
  return <form className="w4-subform" onSubmit={(e) => void save(e)}><h3>Marcador manual por mapas</h3><p className="field-hint">Solo demostración. Ganador: {Math.ceil(bestOf / 2)} mapas; sin empate. Puede simularse antes del horario programado.</p><div className="form-grid">
    <label className="field"><span className="field-label">Mapas de {data.teams.find((t) => t.id === scrim.home)?.name}</span><input type="number" required min={0} max={Math.ceil(bestOf / 2)} value={home} onChange={(e) => setHome(e.target.value)} /></label>
    <label className="field"><span className="field-label">Mapas de {data.teams.find((t) => t.id === scrim.away)?.name}</span><input type="number" required min={0} max={Math.ceil(bestOf / 2)} value={away} onChange={(e) => setAway(e.target.value)} /></label>
  </div><div className="chip-row"><button type="button" className="button button-secondary" onClick={close}>Descartar resultado</button><button className="button button-primary" disabled={busy}>Confirmar resultado demo</button></div></form>
}
function RatingForm({ scrim, close }: { scrim: string; close: () => void }) {
  const { act, busy } = useTeams()
  const [scores, setScores] = useState<Scores>({ Communication: 3, Respect: 3, Sportsmanship: 3, Seriousness: 3, Punctuality: 3 }), [toxic, setToxic] = useState(false), [comment, setComment] = useState('')
  async function save(e: FormEvent) { e.preventDefault(); if (await act({ type: 'rate', scrim, scores, toxic, comment }, 'Valoración demo guardada. No puede repetirse para este enfrentamiento.')) close() }
  return <form className="w4-subform" onSubmit={(e) => void save(e)}><h3>Conducta del equipo rival</h3><p className="field-hint">De 1 (muy mala) a 5 (excelente). Sin recompensas por valoraciones positivas.</p><div className="form-grid">{ratingCategories.map((k) => <label className="field" key={k}><span className="field-label">{teamLabels[k]}</span><select value={scores[k]} onChange={(e) => setScores((s) => ({ ...s, [k]: Number(e.target.value) }))}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} / 5</option>)}</select></label>)}</div>
    <label><input type="checkbox" checked={toxic} onChange={(e) => setToxic(e.target.checked)} /> Señalar comportamiento tóxico (demo)</label>
    <label className="field"><span className="field-label">Comentario opcional</span><textarea maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} /><span className="field-hint">Si escribes: 10–500 caracteres, sin enlaces. Filtro local básico; no hay moderadores reales.</span></label>
    <div className="chip-row"><button type="button" className="button button-secondary" onClick={close}>Descartar valoración</button><button className="button button-primary" disabled={busy}>Guardar valoración</button></div>
  </form>
}
