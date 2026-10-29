import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ranks, regions } from '../../domain/models/community'
import { labels } from '../../shared/i18n/community'
import { teamOf } from '../../domain/models/teams'
import { PageHeading } from '../../shared/ui/PageHeading'
import { EmptyState } from '../../shared/ui/StateViews'
import { useTeams } from './use-teams'
import { TeamIdentityView } from './TeamIdentityView'

export function TeamsPage() {
  const { data, actor, players } = useTeams()
  const [query, setQuery] = useState(''), [region, setRegion] = useState(''), [rank, setRank] = useState(''), [available, setAvailable] = useState(false)
  const teams = data.teams.filter((t) => (!region || t.region === region) && (!rank || t.rank === rank) && (!available || t.members.length < 7) && `${t.name} ${t.tag}`.toLowerCase().includes(query.toLowerCase()))
  return <>
    <PageHeading title="Equipos" description="Encuentra tu próxima plantilla y construye una identidad propia." />
    {!teamOf(data, actor) && <Link className="button button-primary" to="/app/scrims/equipos/crear">Crear equipo</Link>}
    <div className="glass form-card"><div className="form-grid">
      <label className="field"><span className="field-label">Buscar equipo por nombre</span><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
      <label className="field"><span className="field-label">Región</span><select value={region} onChange={(e) => setRegion(e.target.value)}><option value="">Todas</option>{regions.map((v) => <option key={v} value={v}>{labels[v]}</option>)}</select></label>
      <label className="field"><span className="field-label">Rango</span><select value={rank} onChange={(e) => setRank(e.target.value)}><option value="">Todos</option>{ranks.map((v) => <option key={v} value={v}>{labels[v]}</option>)}</select></label>
    </div><label><input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} /> Solo equipos con plazas</label><button className="button button-secondary" onClick={() => { setQuery(''); setRegion(''); setRank(''); setAvailable(false) }}>Limpiar filtros</button></div>
    <p role="status">{teams.length} equipos</p>
    <div className="w4-grid">{teams.map((t) => <TeamIdentityView key={t.id} team={t} players={players} />)}</div>
    {!teams.length && <EmptyState title="No hay equipos con estos filtros" description="Prueba otra combinación o crea tu equipo." />}
  </>
}
