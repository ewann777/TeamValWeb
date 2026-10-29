import { useEffect, useState, useSyncExternalStore } from 'react'
import { Link, Outlet } from 'react-router-dom'
import type { TeamsRepository } from '../../domain/repositories/teams'
import { currentPlayerId } from '../../domain/models/community'
import { teamOf, type TeamCommand } from '../../domain/models/teams'
import { useCommunity } from '../../app/community-context'
import { DemoNotice, ErrorState, LoadingState } from '../../shared/ui/StateViews'

import type { TeamsContext } from './use-teams'
export function TeamsLayout({ repository }: { repository: TeamsRepository }) {
  const state = useSyncExternalStore(repository.subscribe, repository.getState, repository.getState)
  const community = useCommunity()
  const [actor, setActor] = useState(() => { try { return sessionStorage.getItem('teamval.w4.actor') || currentPlayerId } catch { return currentPlayerId } })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  useEffect(() => { void repository.load() }, [repository])
  const players = community.state.status === 'ready' ? community.state.data.profiles : []
  async function act(cmd: TeamCommand, text = 'Cambio guardado en la demostración local.') {
    if (busy) return false
    setBusy(true); setMessage(null)
    const result = await repository.execute(actor, players.map((p) => p.id), cmd)
    setMessage({ ok: result.ok, text: result.ok ? text : result.error ?? 'No se guardó el cambio.' }); setBusy(false)
    return result.ok
  }
  async function reset() {
    if (!window.confirm('¿Reiniciar equipos, logos, scrims y valoraciones W4 de este navegador?')) return
    setBusy(true)
    const result = await repository.reset()
    if (result.ok) { setActor(currentPlayerId); try { sessionStorage.removeItem('teamval.w4.actor') } catch { /* The data reset still succeeded. */ } }
    setMessage({ ok: result.ok, text: result.ok ? 'Demo W4 reiniciada.' : result.error! }); setBusy(false)
  }
  return <div className="w4-page space-y-6">
    <nav className="chip-row" aria-label="Equipos y scrims"><Link className="button button-secondary" to="/app/scrims">Buscar scrims</Link><Link className="button button-secondary" to="/app/scrims/equipos">Equipos</Link><Link className="button button-secondary" to="/app/scrims/agenda">Agenda e historial</Link><Link className="button button-secondary" to="/app/scrims/invitaciones">Invitaciones e ingresos</Link></nav>
    <DemoNotice>Datos ficticios guardados en este navegador. Sin servicio multiusuario, resultados oficiales ni moderación real. Cambia de jugador demo para probar ambas partes de una solicitud.</DemoNotice>
    <div className="glass w4-toolbar">
      <label className="field"><span className="field-label">Actuar como jugador demo</span><select value={actor} disabled={busy} onChange={(e) => { setActor(e.target.value); setMessage(null); try { sessionStorage.setItem('teamval.w4.actor', e.target.value) } catch { setMessage({ ok: false, text: 'No se pudo conservar el jugador demo al cambiar de pantalla.' }) } }}>{players.map((p) => <option key={p.id} value={p.id}>{p.name}{p.id === currentPlayerId ? ' (tu perfil demo)' : ''}</option>)}</select></label>
      {state.status === 'ready' && teamOf(state.data, actor) && <Link className="button button-secondary" to={`/app/scrims/equipos/${teamOf(state.data, actor)!.id}`}>Mi equipo demo</Link>}
      <button className="button button-secondary" disabled={busy} onClick={() => void reset()}>Reiniciar demo W4</button>
    </div>
    {message && <p className={`notice ${message.ok ? 'notice-success' : 'notice-error'}`} role={message.ok ? 'status' : 'alert'}>{message.text}</p>}
    {state.status === 'loading' || community.state.status === 'loading' ? <LoadingState /> : state.status === 'error' ? <ErrorState message={state.message} onRetry={() => void repository.load()} /> : community.state.status === 'error' ? <ErrorState message="No se pudieron leer los perfiles W3." onRetry={community.retry} /> : <Outlet key={actor} context={{ data: state.data, actor, players, busy, act } satisfies TeamsContext} />}
  </div>
}
