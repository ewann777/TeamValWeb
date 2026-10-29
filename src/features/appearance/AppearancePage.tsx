import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { appearancePresets, defaultAppearance, equalAppearance, isHexColor, normalizeHex, type Appearance, type BackgroundStyle, type ThemeMode } from '../../domain/models/appearance'
import { useAppearance } from '../../shared/theme/appearance-context'
import { AppBackground } from '../../shared/theme/AppBackground'
import { Icon, type IconName } from '../../shared/ui/Icon'
import { PageHeading } from '../../shared/ui/PageHeading'

const modes: { value: ThemeMode; label: string; icon: IconName }[] = [
  { value: 'dark', label: 'Oscuro', icon: 'moon' }, { value: 'light', label: 'Claro', icon: 'sun' }, { value: 'system', label: 'Sistema', icon: 'monitor' },
]
const backgrounds: { value: BackgroundStyle; label: string; description: string }[] = [
  { value: 'plain', label: 'Liso', description: 'Simple y esencial' },
  { value: 'aurora', label: 'Aurora', description: 'Luz con tu acento' },
  { value: 'stars', label: 'Estrellas', description: 'Tu pequeño universo' },
]
const accents = [
  { value: '#FF4655', label: 'Rojo TeamVal' }, { value: '#C4B5FD', label: 'Lavanda' },
  { value: '#69C8FF', label: 'Azul cielo' }, { value: '#22D3EE', label: 'Cian' },
  { value: '#70D6A0', label: 'Menta' }, { value: '#F5C76B', label: 'Dorado' },
]

export function AppearancePage() {
  const { saved, preview, save } = useAppearance()
  const [draft, setDraft] = useState<Appearance>(saved)
  const [hexInput, setHexInput] = useState(saved.accent)
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const validHex = isHexColor(hexInput)
  const dirty = !equalAppearance(saved, draft) || !validHex
  const selectedPreset = appearancePresets.find((preset) => equalAppearance(preset.value, draft))

  // Every exit (including navigation tabs and browser Back) ends the preview.
  useEffect(() => () => preview(null), [preview])

  function update(value: Appearance) {
    setDraft(value)
    preview(value)
    setStatus('idle')
  }
  function chooseAppearance(value: Appearance) {
    setHexInput(value.accent)
    update(value)
  }
  async function handleSave() {
    if (!validHex || status === 'saving') return
    setStatus('saving')
    try {
      await save(draft)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return <div className="appearance-page space-y-7">
    <Link to="/app/perfil" className="back-link"><Icon name="back" />Volver al perfil</Link>
    <PageHeading title="Apariencia" description="Colores, tema y fondo de TeamVal. A tu manera."><span className="badge">PERSONALIZACIÓN</span></PageHeading>
    <section className="glass settings-section" aria-labelledby="colores">
      <div className="section-heading"><h2 id="colores">Colores y estilo</h2><p>Encuentra tu combinación. La aplicación cambia contigo.</p></div>
      <div className="live-preview"><AppBackground style={draft.background} /><div className="preview-content"><span className="eyebrow"><Icon name="spark" />VISTA PREVIA EN VIVO</span><div className="preview-title-row"><div><h3>Tu equipo. Tu estilo.</h3><p>El mismo TeamVal, con tu personalidad.</p></div><span className="icon-plate"><Icon name="team" /></span></div><div className="preview-bottom"><span className="sample-button"><Icon name="check" />Así se verá tu acento</span><span className="badge">{selectedPreset?.name ?? 'Personalizado'}</span></div></div></div>
      <fieldset className="settings-group"><legend>Tema de aplicación</legend><p className="field-hint">Elige cómo quieres ver TeamVal.</p><div className="mode-options">{modes.map((mode) => <label key={mode.value} className={`choice mode-choice ${draft.mode === mode.value ? 'selected' : ''}`}><input type="radio" name="theme-mode" value={mode.value} checked={draft.mode === mode.value} onChange={() => update({ ...draft, mode: mode.value })} /><Icon name={mode.icon} /><span>{mode.label}</span>{draft.mode === mode.value && <Icon name="check" className="choice-check" />}</label>)}</div><p className="field-hint">Sistema sigue automáticamente la apariencia de tu dispositivo.</p></fieldset>
      <fieldset className="settings-group"><legend>Estilos de TeamVal</legend><p className="field-hint">Un punto de partida. Después puedes ajustar cada detalle.</p><div className="preset-grid">{appearancePresets.map((preset) => <button key={preset.name} type="button" className={`preset choice ${equalAppearance(preset.value, draft) ? 'selected' : ''}`} aria-pressed={equalAppearance(preset.value, draft)} onClick={() => chooseAppearance(preset.value)}><span className="preset-colors" aria-hidden="true"><i style={{ background: preset.value.accent }} /><i style={{ background: preset.value.mode === 'light' ? '#ECE8E1' : '#0F1923' }} /><i style={{ background: preset.value.mode === 'light' ? '#FFFFFF' : '#345064' }} /></span><span><strong>{preset.name}</strong><small>{preset.description}</small></span>{equalAppearance(preset.value, draft) && <Icon name="check" className="choice-check" />}</button>)}</div></fieldset>
      <fieldset className="settings-group"><legend>Color de acento</legend><p className="field-hint">El toque que une botones, tarjetas y detalles.</p><div className="accent-editor"><div className="swatches">{accents.map((accent) => <button type="button" className="swatch" key={accent.value} aria-label={accent.label} aria-pressed={draft.accent === accent.value} style={{ '--swatch': accent.value } as CSSProperties} onClick={() => chooseAppearance({ ...draft, accent: accent.value })}>{draft.accent === accent.value && <Icon name="check" />}</button>)}</div><div className="hex-field"><label htmlFor="accent-hex">Color personalizado · HEX</label><div className="color-input-row"><input type="color" aria-label="Elegir color personalizado" value={draft.accent} onChange={(event) => chooseAppearance({ ...draft, accent: event.target.value.toUpperCase() })} /><input id="accent-hex" value={hexInput} spellCheck={false} autoComplete="off" maxLength={7} aria-invalid={!validHex} aria-describedby="hex-help" onChange={(event) => { const value = event.target.value; setHexInput(value); setStatus('idle'); if (isHexColor(value)) update({ ...draft, accent: normalizeHex(value) }) }} /></div><p id="hex-help" className={`field-hint ${!validHex ? 'error-text' : ''}`}>{validHex ? 'Seis dígitos, por ejemplo #FF4655.' : 'Introduce un color HEX de seis dígitos.'}</p></div></div></fieldset>
    </section>
    <section className="glass settings-section" aria-labelledby="fondos"><div className="section-heading"><h2 id="fondos">Fondo de la aplicación</h2><p>El escenario de tu próxima partida.</p></div><div className="background-options">{backgrounds.map((background) => <button key={background.value} type="button" className={`background-choice choice ${draft.background === background.value ? 'selected' : ''}`} aria-pressed={draft.background === background.value} onClick={() => update({ ...draft, background: background.value })}><span className="background-thumbnail"><AppBackground style={background.value} />{draft.background === background.value && <span className="selected-marker"><Icon name="check" /></span>}</span><strong>{background.label}</strong><small>{background.description}</small></button>)}</div></section>
    <div className="appearance-info"><Icon name="info" /><p>Los cambios se previsualizan en toda la aplicación. Solo se guardan en este navegador al pulsar <strong>Guardar</strong>. Salir descarta lo que no hayas guardado.</p></div>
    <button type="button" className="reset-button" onClick={() => chooseAppearance(defaultAppearance)}><Icon name="reset" />Restablecer valores predeterminados</button>
    <p className="font-note">Tipografía: Outfit + Exo 2 · <a href="/licenses/outfit_ofl.txt" target="_blank" rel="noreferrer">Licencia Outfit</a> · <a href="/licenses/exo2_ofl.txt" target="_blank" rel="noreferrer">Licencia Exo 2</a> · SIL OFL 1.1</p>
    <div className="save-bar glass"><div className="save-status" aria-live="polite">{status === 'success' ? <span className="success-message"><Icon name="check" />¡Apariencia actualizada!</span> : status === 'error' ? <span className="error-text">No se pudo guardar. Revisa el almacenamiento del navegador e inténtalo otra vez.</span> : <span>{dirty ? 'Tienes cambios sin guardar' : 'Tu estilo está al día'}</span>}</div><div className="save-actions"><Link to="/app/perfil" className="button button-secondary">Volver</Link><button type="button" className="button button-primary" onClick={handleSave} disabled={!validHex || status === 'saving'}><Icon name="check" />{status === 'saving' ? 'Guardando…' : 'Guardar'}</button></div></div>
  </div>
}
