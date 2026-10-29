import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ranks, regions, type Rank, type Region } from '../../domain/models/community'
import { banners, emptyTeam, shapes, symbols, teamOf, type TeamDraft, type TeamIdentity } from '../../domain/models/teams'
import { labels } from '../../shared/i18n/community'
import { teamLabels } from '../../shared/i18n/teams'
import { validateTeam } from '../../domain/rules/teams'
import { PageHeading } from '../../shared/ui/PageHeading'
import { EmptyState } from '../../shared/ui/StateViews'
import { useTeams } from './use-teams'
import { TeamIdentityView } from './TeamIdentityView'
import { importLogo } from './image'

export function TeamEditorPage() {
  const { id } = useParams(), { data, actor } = useTeams()
  const team = data.teams.find((t) => t.id === id)
  if (id && (!team || team.captain !== actor)) return <EmptyState title="Editor no disponible" description="Solo el capitán puede editar un equipo existente." />
  if (!id && teamOf(data, actor)) return <EmptyState title="Ya tienes equipo" description="Solo puedes pertenecer a una plantilla." />
  return <TeamEditor key={id ?? 'new'} initial={team ?? emptyTeam} id={id} revision={team?.revision} />
}
function TeamEditor({ initial, id, revision }: { initial: TeamDraft; id?: string; revision?: number }) {
  const { data, actor, players, busy, act } = useTeams(), navigate = useNavigate()
  const [draft, setDraft] = useState<TeamDraft>(() => structuredClone(initial)), [error, setError] = useState(''), [processing, setProcessing] = useState(false)
  const [baseRevision] = useState(revision)
  const importVersion = useRef(0)
  const change = <K extends keyof TeamDraft>(k: K, value: TeamDraft[K]) => setDraft((d) => ({ ...d, [k]: value }))
  const identity = <K extends keyof TeamIdentity>(k: K, value: TeamIdentity[K]) => setDraft((d) => ({ ...d, identity: { ...d.identity, [k]: value } }))
  const team = data.teams.find((t) => t.id === id)
  async function save(e: FormEvent) {
    e.preventDefault(); const error = validateTeam(draft); setError(error ?? '')
    if (error || processing) return
    if (await act({ type: 'saveTeam', draft, team: id, revision: baseRevision }, 'Equipo guardado.')) navigate(id ? `/app/scrims/equipos/${id}` : '/app/scrims/equipos')
  }
  return <>
    <PageHeading title={id ? 'Editar equipo' : 'Crear equipo'} description="Tu identidad, tu plantilla. Vista previa local antes de guardar." />
    <TeamIdentityView team={{ ...draft, id: id ?? 'preview', revision: revision ?? 0, captain: team?.captain ?? actor, members: team?.members ?? [actor] }} players={players} />
    <form className="glass form-card" onSubmit={(e) => void save(e)}>
      {error && <p role="alert" className="field-error">{error}</p>}
      <div className="form-grid">
        <label className="field"><span className="field-label">Nombre del equipo</span><input required minLength={3} maxLength={24} value={draft.name} onChange={(e) => change('name', e.target.value)} /></label>
        <label className="field"><span className="field-label">Abreviatura</span><input required minLength={2} maxLength={5} value={draft.tag} onChange={(e) => change('tag', e.target.value)} /></label>
        <label className="field"><span className="field-label">Región</span><select value={draft.region} onChange={(e) => change('region', e.target.value as Region)}>{regions.map((v) => <option key={v} value={v}>{labels[v]}</option>)}</select></label>
        <label className="field"><span className="field-label">Rango competitivo declarado</span><select value={draft.rank} onChange={(e) => change('rank', e.target.value as Rank)}>{ranks.map((v) => <option key={v} value={v}>{labels[v]}</option>)}</select></label>
      </div>
      <label className="field"><span className="field-label">Descripción</span><textarea required minLength={10} maxLength={300} value={draft.description} onChange={(e) => change('description', e.target.value)} /></label>
      <label className="field"><span className="field-label">Lema</span><input maxLength={80} value={draft.motto} onChange={(e) => change('motto', e.target.value)} /></label>
      <fieldset className="settings-group"><legend>Editor de logo e identidad</legend><div className="form-grid">
        <label className="field"><span className="field-label">Forma</span><select value={draft.identity.shape} onChange={(e) => identity('shape', e.target.value as TeamIdentity['shape'])}>{shapes.map((v) => <option key={v} value={v}>{teamLabels[v]}</option>)}</select></label>
        <label className="field"><span className="field-label">Símbolo</span><select value={draft.identity.symbol} onChange={(e) => identity('symbol', e.target.value as TeamIdentity['symbol'])}>{symbols.map((v) => <option key={v} value={v}>{teamLabels[v]}</option>)}</select></label>
        <label className="field"><span className="field-label">Letras del logo</span><input maxLength={3} value={draft.identity.letters} onChange={(e) => identity('letters', e.target.value)} /></label>
        <label className="field"><span className="field-label">Color del símbolo</span><input type="color" value={draft.identity.color} onChange={(e) => identity('color', e.target.value)} /></label>
        <label className="field"><span className="field-label">Fondo del logo</span><input type="color" value={draft.identity.background} onChange={(e) => identity('background', e.target.value)} /></label>
        <label className="field"><span className="field-label">Fondo de tarjeta</span><select value={draft.identity.banner} onChange={(e) => identity('banner', e.target.value as TeamIdentity['banner'])}>{banners.map((v) => <option key={v} value={v}>{teamLabels[v]}</option>)}</select></label>
        <label className="field"><span className="field-label">Distribución</span><select value={draft.identity.layout} onChange={(e) => identity('layout', e.target.value as TeamIdentity['layout'])}><option value="Standard">Estándar</option><option value="Spotlight">Destacado</option></select></label>
        <label className="field"><span className="field-label">Estilo de integrantes</span><select value={draft.identity.members} onChange={(e) => identity('members', e.target.value as TeamIdentity['members'])}><option value="Grid">Cuadrícula</option><option value="List">Lista</option></select></label>
      </div></fieldset>
      <label className="field"><span className="field-label">Subir logo personalizado</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => {
        const file = e.target.files?.[0]; if (!file) return
        const token = ++importVersion.current; setProcessing(true); setError('')
        void importLogo(file).then((image) => { if (token === importVersion.current) setDraft((d) => ({ ...d, identity: { ...d.identity, image, zoom: 1, x: 50, y: 50 } })) }).catch((e: unknown) => { if (token === importVersion.current) setError(e instanceof Error ? e.message : 'Error al importar.') }).finally(() => { if (token === importVersion.current) setProcessing(false) })
      }} /><span className="field-hint">JPG, PNG o WebP; hasta 10 MB. De 64 a 8192 px por lado, máximo 32 MP. Recomendado 512×512. Procesamiento local, sin moderación real.</span></label>
      {processing && <p role="status">Procesando imagen…</p>}
      {draft.identity.image && <><div className="form-grid">{(['zoom', 'x', 'y'] as const).map((key) => <label className="field" key={key}><span className="field-label">{key === 'zoom' ? 'Zoom' : key === 'x' ? 'Posición horizontal' : 'Posición vertical'}</span><input type="range" min={key === 'zoom' ? 1 : 0} max={key === 'zoom' ? 4 : 100} step={key === 'zoom' ? .1 : 1} value={draft.identity[key]} onChange={(e) => identity(key, Number(e.target.value))} /></label>)}</div><button type="button" className="button button-secondary" onClick={() => identity('image', null)}>Usar logo de formas</button></>}
      <div className="form-actions"><Link className="button button-secondary" to={id ? `/app/scrims/equipos/${id}` : '/app/scrims/equipos'}>Cancelar</Link><button className="button button-primary" disabled={busy || processing}>Guardar equipo</button></div>
    </form>
  </>
}
