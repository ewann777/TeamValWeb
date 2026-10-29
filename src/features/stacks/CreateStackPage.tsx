import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { categoryOf, gameModes, initialStackDraft, rankPreferences, regions, type FieldErrors, type GameMode, type RankPreference, type Region, type StackDraft } from '../../domain/models/community'
import { validateStack } from '../../domain/rules/community'
import { communityErrors, labels } from '../../shared/i18n/community'
import { useCommunity } from '../../app/community-context'
import { PageHeading } from '../../shared/ui/PageHeading'
import { Icon } from '../../shared/ui/Icon'
import { DemoNotice } from '../../shared/ui/StateViews'

const capacityOptions = [2, 3, 4, 5]

export function CreateStackPage() {
  const { repository, state, me } = useCommunity()
  const navigate = useNavigate()
  const [draft, setDraft] = useState<StackDraft>(initialStackDraft)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [actionError, setActionError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const update = <K extends keyof StackDraft>(key: K, value: StackDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
    setErrors((current) => { if (!current[key]) return current; const next = { ...current }; delete next[key]; return next })
    setActionError(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const found = validateStack(draft)
    setErrors(found)
    if (Object.keys(found).length || saving) return
    setSaving(true)
    const result = await repository.create(draft)
    setSaving(false)
    if (result.ok) navigate('/app/buscar-equipo', { state: { created: result.value } })
    else setActionError(communityErrors[result.error])
  }

  const remaining = draft.capacity - 1

  return <div className="create-page space-y-6">
    <Link to="/app/buscar-equipo" className="back-link"><Icon name="back" />Volver a Buscar equipo</Link>
    <PageHeading title="Crear publicación" description="Cuéntale al equipo qué buscas. Tú ocupas la primera plaza." />

    {state.status === 'error' && <div role="alert" className="notice notice-error"><Icon name="info" /><p>{communityErrors.Storage}</p></div>}
    {actionError && <div role="alert" className="notice notice-error"><Icon name="info" /><p>{actionError}</p></div>}

    <form className="glass form-card" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span className="field-label">Título de la publicación</span>
        <input value={draft.title} maxLength={60} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'title-error' : 'title-hint'} onChange={(event) => update('title', event.target.value)} />
        {errors.title ? <span id="title-error" className="field-error">{errors.title}</span> : <span id="title-hint" className="field-hint">Entre 5 y 60 caracteres.</span>}
      </label>

      <label className="field">
        <span className="field-label">Descripción</span>
        <textarea rows={4} value={draft.description} maxLength={300} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? 'description-error' : 'description-hint'} onChange={(event) => update('description', event.target.value)} />
        <span className={`field-hint ${errors.description ? 'field-error' : ''}`} id={errors.description ? 'description-error' : 'description-hint'}>{errors.description ?? `${draft.description.trim().length}/300 · Describe tu equipo en al menos 10 caracteres.`}</span>
      </label>

      <fieldset className="settings-group">
        <legend>Tamaño del stack</legend>
        <p className="field-hint">El tamaño incluye tu plaza.</p>
        <div className="capacity-options">
          {capacityOptions.map((size) => <button key={size} type="button" className={`choice capacity-choice ${draft.capacity === size ? 'selected' : ''}`} aria-pressed={draft.capacity === size} onClick={() => update('capacity', size)}>
            <strong>{size} {size === 1 ? 'jugador' : 'jugadores'}</strong>
            <span>{labels[categoryOf(size)]}</span>
            {draft.capacity === size && <Icon name="check" className="choice-check" />}
          </button>)}
        </div>
        <p className="field-hint capacity-summary">
          {`Tú ocupas 1 de ${draft.capacity} plazas; ${remaining === 1 ? 'falta 1 jugador' : `faltan ${remaining} jugadores`} para completar el grupo.`}
        </p>
        {errors.capacity && <span className="field-error">{errors.capacity}</span>}
      </fieldset>

      <div className="form-grid">
        <label className="field"><span className="field-label">Rango</span>
          <select value={draft.rank} onChange={(event) => update('rank', event.target.value as RankPreference)}>
            {rankPreferences.map((value) => <option key={value} value={value}>{labels[value]}</option>)}
          </select>
          {errors.rank && <span className="field-error">{errors.rank}</span>}
        </label>
        <label className="field"><span className="field-label">Región</span>
          <select value={draft.region} onChange={(event) => update('region', event.target.value as Region)}>
            {regions.map((value) => <option key={value} value={value}>{labels[value]}</option>)}
          </select>
          {errors.region && <span className="field-error">{errors.region}</span>}
        </label>
        <label className="field"><span className="field-label">Modalidad</span>
          <select value={draft.mode} onChange={(event) => update('mode', event.target.value as GameMode)}>
            {gameModes.map((value) => <option key={value} value={value}>{labels[value]}</option>)}
          </select>
          {errors.mode && <span className="field-error">{errors.mode}</span>}
        </label>
      </div>

      <p className="field-hint">El rango es una preferencia de búsqueda; esta demo no valida las restricciones de emparejamiento de VALORANT.</p>
      <DemoNotice>{me ? `Publicas como ${me.name}. ` : ''}Todo se guarda únicamente en este navegador.</DemoNotice>

      <div className="form-actions">
        <Link to="/app/buscar-equipo" className="button button-secondary">Cancelar</Link>
        <button type="submit" className="button button-primary" disabled={saving || state.status !== 'ready'}><Icon name="check" />{saving ? 'Publicando…' : 'Publicar stack'}</button>
      </div>
    </form>
  </div>
}
