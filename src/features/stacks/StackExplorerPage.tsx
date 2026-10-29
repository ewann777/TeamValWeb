import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { currentPlayerId, gameModes, ranks, regions, type Category, type GameMode, type Rank, type Region, type Result } from '../../domain/models/community'
import { searchPosts } from '../../domain/rules/community'
import { communityErrors, labels } from '../../shared/i18n/community'
import { useCommunity } from '../../app/community-context'
import { PageHeading } from '../../shared/ui/PageHeading'
import { Icon } from '../../shared/ui/Icon'
import { DemoNotice, EmptyState, ErrorState, LoadingState } from '../../shared/ui/StateViews'
import { StackPostCard } from './StackPostCard'

type Filters = { rankMin?: Rank; rankMax?: Rank; region?: Region; mode?: GameMode }
type Message = { tone: 'success' | 'error'; text: string }
const categories: Category[] = ['Duo', 'Trio', 'Stack']

const emptyOption = (value: string) => value === ''
const selectOptions = (values: readonly string[], map: (value: string) => string) => values.map((value) => <option key={value} value={value}>{map(value)}</option>)

export function StackExplorerPage() {
  const { state, repository, me, profileOf, retry } = useCommunity()
  const location = useLocation()
  const navigate = useNavigate()
  // Al volver de la creación, la ruta monta de nuevo: los valores iniciales
  // restablecen los filtros y dejan la publicación propia visible al instante.
  const created = Boolean((location.state as { created?: string } | null)?.created)
  const [category, setCategory] = useState<Category | null>(null)
  const [ownOnly, setOwnOnly] = useState(created)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState<Message | null>(created ? { tone: 'success', text: 'Publicación creada. Ya puedes simular candidatos y gestionar solicitudes.' } : null)

  async function act(operation: () => Promise<Result<string>>, success: string, id: string) {
    setBusyId(id); setMessage(null)
    const result = await operation()
    setBusyId(null)
    setMessage(result.ok ? { tone: 'success', text: success } : { tone: 'error', text: communityErrors[result.error] })
  }

  const header = <PageHeading title="Buscar equipo" description="Dúo, trío o stack · tu rango, tu región y tu modalidad de VALORANT." />

  if (state.status === 'loading') return <div className="stacks-page space-y-6">{header}<LoadingState label="Cargando publicaciones…" /></div>
  if (state.status === 'error' || !me) return <div className="stacks-page space-y-6">{header}<ErrorState message={communityErrors.Storage} onRetry={retry} /></div>

  const snapshot = state.data
  const posts = searchPosts(snapshot, { category: category ?? undefined, ...filters, ownOnly, query }, currentPlayerId)
  const filtersActive = Boolean(filters.rankMin || filters.rankMax || filters.region || filters.mode || query.trim())
  const pendingForMe = snapshot.requests.filter((request) => request.status === 'Pending' && snapshot.posts.find((post) => post.id === request.postId)?.ownerId === currentPlayerId).length

  function clearFilters() { setFilters({}); setQuery('') }
  function toggleCategory(value: Category) { setCategory((current) => current === value ? null : value) }

  const empty = (() => {
    if (filtersActive) return { description: 'No hay publicaciones con estos filtros. Prueba otra combinación.', action: <button type="button" className="button button-secondary" onClick={clearFilters}><Icon name="close" />Limpiar filtros</button> }
    if (category) return { description: 'No hay publicaciones de este tipo ahora mismo. Prueba otra pestaña o vuelve a ver todos.', action: <button type="button" className="button button-secondary" onClick={() => setCategory(null)}>Ver todos los grupos</button> }
    if (ownOnly) return { description: 'Crea tu primera publicación e invita a otros jugadores a compartir la partida.', action: <Link className="button button-primary" to="/app/buscar-equipo/crear"><Icon name="plus" />Crear publicación</Link> }
    return { description: 'Todavía no hay publicaciones. Crea la primera y forma tu equipo.', action: <Link className="button button-primary" to="/app/buscar-equipo/crear"><Icon name="plus" />Crear publicación</Link> }
  })()

  return <div className="stacks-page space-y-6">
    {header}

    <div className="category-tabs" role="group" aria-label="Tipo de grupo">
      {categories.map((value) => <button key={value} type="button" className={`category-tab ${category === value ? 'selected' : ''}`} aria-pressed={category === value} onClick={() => toggleCategory(value)}>{labels[value]}</button>)}
    </div>

    <div className="scope-row" role="group" aria-label="Alcance de la búsqueda">
      <button type="button" className="chip chip-toggle" aria-pressed={!ownOnly} onClick={() => setOwnOnly(false)}>Explorar</button>
      <button type="button" className="chip chip-toggle" aria-pressed={ownOnly} onClick={() => setOwnOnly(true)}>Mis publicaciones</button>
      <span className="badge demo-inline">DEMO LOCAL</span>
    </div>

    {message && <div role={message.tone === 'error' ? 'alert' : 'status'} className={`notice action-notice ${message.tone === 'error' ? 'notice-error' : 'notice-success'}`}>
      <Icon name={message.tone === 'error' ? 'info' : 'check'} /><p>{message.text}</p>
      <button type="button" className="notice-dismiss" aria-label="Cerrar mensaje" onClick={() => setMessage(null)}><Icon name="close" /></button>
    </div>}

    <div className="explorer-grid">
      <aside className="glass explorer-aside" aria-label="Búsqueda y acciones">
        <label className="field search-field">
          <span className="field-label">Buscar</span>
          <span className="input-with-icon"><Icon name="search" /><input type="search" value={query} placeholder="Título o anfitrión" onChange={(event) => setQuery(event.target.value)} /></span>
        </label>
        <button type="button" className="button button-secondary button-block" aria-expanded={showFilters} onClick={() => setShowFilters((open) => !open)}>
          <Icon name="filter" />{showFilters ? 'Ocultar filtros' : filtersActive ? 'Filtros activos · Editar' : 'Filtrar stacks'}
        </button>
        {showFilters && <div className="filters-panel">
          {(['rankMin', 'rankMax'] as const).map((key) => <label className="field" key={key}><span className="field-label">{key === 'rankMin' ? 'Rango mínimo' : 'Rango máximo'}</span>
            <select value={filters[key] ?? ''} onChange={(event) => setFilters((current) => ({ ...current, [key]: emptyOption(event.target.value) ? undefined : event.target.value as Rank }))}>
              <option value="">Sin límite</option>{selectOptions(ranks, (value) => labels[value as Rank])}
            </select>
          </label>)}
          {filters.rankMin && filters.rankMax && ranks.indexOf(filters.rankMin) > ranks.indexOf(filters.rankMax) && <p role="alert" className="field-error">El rango mínimo no puede superar al máximo.</p>}
          <p className="field-hint">También se incluyen publicaciones de cualquier rango.</p>
          <label className="field"><span className="field-label">Región</span>
            <select value={filters.region ?? ''} onChange={(event) => setFilters((current) => ({ ...current, region: emptyOption(event.target.value) ? undefined : event.target.value as Region }))}>
              <option value="">Todas las regiones</option>{selectOptions(regions, (value) => labels[value as Region])}
            </select>
          </label>
          <label className="field"><span className="field-label">Modalidad</span>
            <select value={filters.mode ?? ''} onChange={(event) => setFilters((current) => ({ ...current, mode: emptyOption(event.target.value) ? undefined : event.target.value as GameMode }))}>
              <option value="">Todas las modalidades</option>{selectOptions(gameModes, (value) => labels[value as GameMode])}
            </select>
          </label>
          <button type="button" className="reset-button" onClick={clearFilters}><Icon name="reset" />Limpiar filtros</button>
        </div>}
        <div className="aside-actions">
          <Link className="button button-primary button-block" to="/app/buscar-equipo/crear"><Icon name="plus" />Crear publicación</Link>
          <Link className="button button-secondary button-block" to="/app/buscar-equipo/solicitudes"><Icon name="requests" />Solicitudes{pendingForMe > 0 ? ` (${pendingForMe})` : ''}</Link>
        </div>
        <DemoNotice>Juegas como {me.name}. Publicaciones, perfiles y solicitudes son ficticios y se guardan en este navegador; puedes reiniciarlos desde tu perfil.</DemoNotice>
      </aside>

      <section className="explorer-results" aria-label="Publicaciones">
        <p className="result-count" aria-live="polite">{posts.length} {posts.length === 1 ? 'publicación' : 'publicaciones'}</p>
        {posts.length === 0
          ? <EmptyState title="Tu próximo equipo está por llegar" description={empty.description}>{empty.action}</EmptyState>
          : posts.map((post) => <StackPostCard
              key={post.id}
              post={post}
              owner={profileOf(post.ownerId)}
              members={post.memberIds.map((id) => profileOf(id)).filter((profile) => profile !== undefined)}
              isOwner={post.ownerId === currentPlayerId}
              isMember={post.memberIds.includes(currentPlayerId)}
              requestStatus={snapshot.requests.find((request) => request.postId === post.id && request.applicantId === currentPlayerId)?.status}
              pendingCount={snapshot.requests.filter((request) => request.postId === post.id && request.status === 'Pending').length}
              busy={busyId === post.id}
              onJoin={() => void act(() => repository.join(post.id), 'Solicitud enviada. Puedes consultarla en Solicitudes → Enviadas.', post.id)}
              onSimulate={() => void act(() => repository.simulate(post.id), 'Ha llegado una solicitud ficticia. Revísala en Solicitudes → Recibidas.', post.id)}
              onManage={() => navigate(`/app/buscar-equipo/solicitudes?publicacion=${post.id}`)}
            />)}
      </section>
    </div>
  </div>
}
