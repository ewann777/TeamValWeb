import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { avatars, badges, frames, profileBackgrounds, ranks, regions, type FieldErrors, type PlayerProfile } from '../../domain/models/community'
import { validateProfile } from '../../domain/rules/community'
import { communityErrors, labels } from '../../shared/i18n/community'
import { useCommunity } from '../../app/community-context'
import { PageHeading } from '../../shared/ui/PageHeading'
import { Icon } from '../../shared/ui/Icon'
import { Avatar } from '../../shared/ui/Avatar'
import { ErrorState, LoadingState } from '../../shared/ui/StateViews'
import { AgentPicker } from './AgentPicker'
import { ProfileCard } from './ProfileCard'

export function EditProfilePage() {
  const { state, repository, me, retry } = useCommunity()
  const [draft, setDraft] = useState<PlayerProfile | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  if (state.status === 'loading') return <div className="profile-page space-y-6"><LoadingState label="Cargando tu perfil…" /></div>
  if (state.status === 'error' || !me) return <div className="profile-page space-y-6"><ErrorState message={communityErrors.Storage} onRetry={retry} /></div>

  const form = draft ?? me
  const update = <K extends keyof PlayerProfile>(key: K, value: PlayerProfile[K]) => {
    setDraft({ ...form, [key]: value })
    setErrors((current) => { if (!current[key as string]) return current; const next = { ...current }; delete next[key as string]; return next })
    setMessage(null)
  }
  const toggleBadge = (badge: typeof badges[number]) => update('badges', form.badges.includes(badge) ? form.badges.filter((item) => item !== badge) : [...form.badges, badge])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const found = validateProfile(form)
    setErrors(found)
    if (Object.keys(found).length || saving) { if (Object.keys(found).length) setMessage({ tone: 'error', text: 'Revisa el nombre, el Riot ID y los campos marcados antes de guardar.' }); return }
    setSaving(true)
    const result = await repository.saveProfile(form)
    setSaving(false)
    if (result.ok) { setDraft({ ...form, revision: form.revision + 1 }); setMessage({ tone: 'success', text: 'Cambios guardados en este dispositivo.' }) }
    else setMessage({ tone: 'error', text: communityErrors[result.error] })
  }

  return <div className="profile-page space-y-6">
    <Link to="/app/perfil" className="back-link"><Icon name="back" />Volver al perfil</Link>
    <PageHeading title="Editar perfil" description="Tu nombre, tus datos de jugador y tu estilo. Vista previa en directo." />

    {message && <div role={message.tone === 'error' ? 'alert' : 'status'} className={`notice action-notice ${message.tone === 'error' ? 'notice-error' : 'notice-success'}`}>
      <Icon name={message.tone === 'error' ? 'info' : 'check'} /><p>{message.text}</p>
    </div>}

    <div className="edit-preview"><ProfileCard profile={form} own /><p className="field-hint"><Icon name="info" className="inline-icon" />Vista previa en directo. Volver al perfil descarta los cambios sin guardar.</p></div>

    <form className="glass form-card" onSubmit={handleSubmit} noValidate>
      <fieldset className="settings-group">
        <legend>Identidad</legend>
        <div className="form-grid">
          <label className="field"><span className="field-label">Nombre de jugador</span>
            <input value={form.name} maxLength={24} aria-invalid={Boolean(errors.name)} onChange={(event) => update('name', event.target.value)} />
            <span className={`field-hint ${errors.name ? 'field-error' : ''}`}>{errors.name ?? 'Entre 3 y 24 caracteres, sin espacios en los extremos.'}</span>
          </label>
          <label className="field"><span className="field-label">Riot ID</span>
            <input value={form.riotId} maxLength={36} spellCheck={false} aria-invalid={Boolean(errors.riotId)} onChange={(event) => update('riotId', event.target.value)} />
            <span className={`field-hint ${errors.riotId ? 'field-error' : ''}`}>{errors.riotId ?? 'Formato Nombre#Etiqueta. Declarado por ti: no se verifica con Riot.'}</span>
          </label>
        </div>
      </fieldset>

      <fieldset className="settings-group">
        <legend>Datos de jugador</legend>
        <div className="form-grid">
          <label className="field"><span className="field-label">Región</span>
            <select value={form.region} onChange={(event) => update('region', event.target.value as PlayerProfile['region'])}>
              {regions.map((value) => <option key={value} value={value}>{labels[value]}</option>)}
            </select>
          </label>
          <label className="field"><span className="field-label">Rango declarado</span>
            <select value={form.rank} onChange={(event) => update('rank', event.target.value as PlayerProfile['rank'])}>
              {ranks.map((value) => <option key={value} value={value}>{labels[value]}</option>)}
            </select>
          </label>
        </div>
        <p className="field-hint">Datos declarados por ti para buscarte; esta demo no valida rangos ni cuentas.</p>
      </fieldset>

      <fieldset className="settings-group">
        <legend>Agente principal</legend>
        <p className="field-hint">Roster completo de VALORANT. Busca por nombre o filtra por rol.</p>
        <AgentPicker value={form.agent} invalid={Boolean(errors.agent)} onSelect={(agent) => update('agent', agent as PlayerProfile['agent'])} />
        {errors.agent && <span className="field-error">{errors.agent}</span>}
      </fieldset>

      <fieldset className="settings-group">
        <legend>Presentación</legend>
        <label className="field"><span className="field-label">Tu presentación</span>
          <input value={form.headline} maxLength={80} aria-invalid={Boolean(errors.headline)} onChange={(event) => update('headline', event.target.value)} />
          <span className={`field-hint ${errors.headline ? 'field-error' : ''}`}>{errors.headline ?? `${form.headline.length}/80 · Una frase que te represente.`}</span>
        </label>
        <label className="field"><span className="field-label">Sobre mí</span>
          <textarea rows={4} value={form.biography} maxLength={300} aria-invalid={Boolean(errors.biography)} onChange={(event) => update('biography', event.target.value)} />
          <span className={`field-hint ${errors.biography ? 'field-error' : ''}`}>{errors.biography ?? `${form.biography.length}/300 · Cuéntanos cómo disfrutas jugar.`}</span>
        </label>
      </fieldset>

      <fieldset className="settings-group">
        <legend>Elige tu avatar</legend>
        <div className="option-grid">
          {avatars.map((avatar) => <button key={avatar} type="button" className={`option-choice ${form.avatar === avatar ? 'selected' : ''}`} aria-pressed={form.avatar === avatar} onClick={() => update('avatar', avatar)}>
            <Avatar profile={{ ...form, avatar }} size="md" /><span>{labels[avatar]}</span>
          </button>)}
        </div>
      </fieldset>

      <fieldset className="settings-group">
        <legend>Marco del avatar</legend>
        <div className="chip-options">
          {frames.map((frame) => <button key={frame} type="button" className="chip chip-toggle" aria-pressed={form.frame === frame} onClick={() => update('frame', frame)}>{labels[frame]}</button>)}
        </div>
      </fieldset>

      <fieldset className="settings-group">
        <legend>Fondo del perfil</legend>
        <div className="chip-options">
          {profileBackgrounds.map((background) => <button key={background} type="button" className="chip chip-toggle" aria-pressed={form.background === background} onClick={() => update('background', background)}>{labels[background]}</button>)}
        </div>
      </fieldset>

      <fieldset className="settings-group">
        <legend>Tus insignias</legend>
        <p className="field-hint">Distintivos decorativos de demostración. Selecciona los que quieras mostrar.</p>
        <div className="chip-options">
          {badges.map((badge) => <button key={badge} type="button" className="chip chip-toggle" aria-pressed={form.badges.includes(badge)} onClick={() => toggleBadge(badge)}><Icon name="star" className="chip-icon" />{labels[badge]}</button>)}
        </div>
        {errors.cosmetics && <span className="field-error">{errors.cosmetics}</span>}
      </fieldset>

      <div className="form-actions">
        <Link to="/app/perfil" className="button button-secondary">Volver</Link>
        <button type="submit" className="button button-primary" disabled={saving}><Icon name="check" />{saving ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </form>
  </div>
}
