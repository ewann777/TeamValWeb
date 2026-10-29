import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ranks, regions, type Rank, type Region } from '../../domain/models/community'
import { divisions, teamOf, type Division, type ScrimDraft } from '../../domain/models/teams'
import { labels } from '../../shared/i18n/community'
import { PageHeading } from '../../shared/ui/PageHeading'
import { EmptyState } from '../../shared/ui/StateViews'
import { useTeams } from '../teams/use-teams'

export function CreateScrimPage() {
  const { data, actor } = useTeams(), mine = teamOf(data, actor)
  if (!mine || mine.captain !== actor) return <EmptyState title="Solo para capitanes" description="Crea un equipo o pide a tu capitán que publique la búsqueda." />
  return <ScrimForm initial={{ team: mine.id, region: mine.region, rank: mine.rank, division: 'Elite', tier: 1, date: '', bestOf: 3, notes: '' }} />
}
function ScrimForm({ initial }: { initial: ScrimDraft }) {
  const [draft, setDraft] = useState(initial), [local, setLocal] = useState(''), [error, setError] = useState('')
  const { act, busy } = useTeams(), navigate = useNavigate()
  const change = <K extends keyof ScrimDraft>(k: K, v: ScrimDraft[K]) => setDraft((d) => ({ ...d, [k]: v }))
  async function submit(e: FormEvent) {
    e.preventDefault()
    const date = new Date(local)
    if (!Number.isFinite(date.getTime())) { setError('Selecciona una fecha y hora válidas.'); return }
    if (await act({ type: 'publish', draft: { ...draft, date: date.toISOString() } }, 'Búsqueda de rival publicada.')) navigate('/app/scrims')
  }
  return <><PageHeading title="Publicar búsqueda de rival" description="Fecha y hora locales; se guardan en UTC. Sin vínculo con Premier oficial." />
    <form className="glass form-card" onSubmit={(e) => void submit(e)}>
      {error && <p role="alert">{error}</p>}
      <div className="form-grid">
        <label className="field"><span className="field-label">Región</span><select value={draft.region} onChange={(e) => change('region', e.target.value as Region)}>{regions.map((v) => <option key={v} value={v}>{labels[v]}</option>)}</select></label>
        <label className="field"><span className="field-label">Rango</span><select value={draft.rank} onChange={(e) => change('rank', e.target.value as Rank)}>{ranks.map((v) => <option key={v} value={v}>{labels[v]}</option>)}</select></label>
        <label className="field"><span className="field-label">División Premier</span><select value={draft.division} onChange={(e) => setDraft((d) => ({ ...d, division: e.target.value as Division, tier: 1 }))}>{divisions.map((v) => <option key={v}>{v}</option>)}</select></label>
        {!['Invite', 'Contender'].includes(draft.division) && <label className="field"><span className="field-label">Grupo Premier</span><select value={draft.tier} onChange={(e) => change('tier', Number(e.target.value))}>{[1, 2, 3, 4, 5].map((v) => <option key={v}>{v}</option>)}</select></label>}
        <label className="field"><span className="field-label">Fecha y horario local</span><input type="datetime-local" required value={local} onChange={(e) => setLocal(e.target.value)} /></label>
        <label className="field"><span className="field-label">Modalidad</span><select value={draft.bestOf} onChange={(e) => change('bestOf', Number(e.target.value) as 1 | 3 | 5)}>{[1, 3, 5].map((v) => <option key={v} value={v}>Mejor de {v}</option>)}</select></label>
      </div>
      <label className="field"><span className="field-label">Notas</span><textarea maxLength={300} value={draft.notes} onChange={(e) => change('notes', e.target.value)} /></label>
      <div className="form-actions"><Link to="/app/scrims" className="button button-secondary">Cancelar</Link><button className="button button-primary" disabled={busy}>Publicar scrim</button></div>
    </form>
  </>
}
