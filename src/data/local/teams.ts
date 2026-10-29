import { divisions, ratingCategories, type TeamCommand, type TeamsSnapshot } from '../../domain/models/teams'
import { ranks, regions } from '../../domain/models/community'
import type { TeamsRepository, TeamsState } from '../../domain/repositories/teams'
import { applyTeamCommand, validateTeam } from '../../domain/rules/teams'
import { createTeamsDemo } from '../demo/teams'

function validate(value: unknown): TeamsSnapshot {
  const s = value as TeamsSnapshot
  if (!s || s.version !== 1 || ![s.teams, s.memberships, s.posts, s.scrims, s.ratings].every(Array.isArray)) throw Error('Datos W4 no válidos.')
  const members = new Set<string>()
  for (const t of s.teams) {
    if (validateTeam(t) || !Array.isArray(t.members) || !t.members.includes(t.captain) || t.members.length > 7 || !Number.isInteger(t.revision) || t.revision < 0) throw Error('Equipo local no válido.')
    for (const m of t.members) { if (members.has(m)) throw Error('Membresía duplicada.'); members.add(m) }
  }
  for (const list of [s.teams, s.memberships, s.posts, s.scrims, s.ratings]) if (list.some((v) => !v || typeof v.id !== 'string' || !v.id) || new Set(list.map((v) => v.id)).size !== list.length) throw Error('Identificador inválido o duplicado.')
  if (s.posts.some((p) => !s.teams.some((t) => t.id === p.team) || !Number.isFinite(Date.parse(p.date)) || !regions.includes(p.region) || !ranks.includes(p.rank) || !divisions.includes(p.division) || ![1, 3, 5].includes(p.bestOf) || !Number.isInteger(p.tier) || p.tier < 1 || p.tier > (['Invite', 'Contender'].includes(p.division) ? 1 : 5) || !['Open', 'Matched', 'Closed'].includes(p.status) || typeof p.notes !== 'string' || p.notes.length > 300)) throw Error('Publicación inválida.')
  if (s.memberships.some((r) => !s.teams.some((t) => t.id === r.team) || typeof r.player !== 'string' || !r.player || !['Invite', 'Join'].includes(r.kind) || !['Pending', 'Accepted', 'Rejected', 'Cancelled'].includes(r.status))) throw Error('Solicitud inválida.')
  const pairs = new Set<string>()
  for (const r of s.scrims) {
    const p = s.posts.find((p) => p.id === r.post)
    const pair = `${r.post}/${r.away}`
    if (r.home === r.away || !p || r.home !== p.team || ![r.home, r.away].every((id) => s.teams.some((t) => t.id === id)) || !['Pending', 'Accepted', 'Rejected', 'Cancelled', 'Completed'].includes(r.status) || pairs.has(pair)) throw Error('Scrim inválida.')
    pairs.add(pair)
    if (r.status === 'Completed') {
      const wins = Math.ceil(p.bestOf / 2)
      if (![r.homeScore, r.awayScore].every((v) => v !== undefined && Number.isInteger(v) && v >= 0 && v <= wins) || r.homeScore === r.awayScore || Math.max(r.homeScore!, r.awayScore!) !== wins) throw Error('Resultado inválido.')
    }
  }
  const reviews = new Set<string>()
  for (const r of s.ratings) {
    const scrim = s.scrims.find((v) => v.id === r.scrim), pair = `${r.scrim}/${r.from}`
    if (!scrim || scrim.status !== 'Completed' || r.from === r.to || ![r.from, r.to].every((id) => [scrim.home, scrim.away].includes(id)) || reviews.has(pair) || !r.scores || !ratingCategories.every((k) => Number.isInteger(r.scores[k]) && r.scores[k] >= 1 && r.scores[k] <= 5) || typeof r.toxic !== 'boolean' || typeof r.comment !== 'string' || r.comment.length > 500 || !Number.isFinite(Date.parse(r.date)) || !Array.isArray(r.reports) || r.reports.some((id) => id !== r.to) || r.reports.length > 1) throw Error('Valoración inválida.')
    reviews.add(pair)
  }
  return s
}

export class LocalTeamsRepository implements TeamsRepository {
  private state: TeamsState = { status: 'loading' }
  private listeners = new Set<() => void>()
  private db?: Promise<IDBDatabase>
  private channel?: BroadcastChannel
  getState = () => this.state
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    if (!this.channel && typeof BroadcastChannel !== 'undefined') { this.channel = new BroadcastChannel('teamval.teams.demo.v1'); this.channel.onmessage = () => { void this.load() } }
    const refresh = () => { void this.load() }
    window.addEventListener('focus', refresh)
    return () => { this.listeners.delete(listener); window.removeEventListener('focus', refresh) }
  }
  private publish(state: TeamsState) { this.state = state; this.listeners.forEach((fn) => fn()) }
  private open() {
    this.db ??= new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open('teamval.teams.demo.v1', 1)
      r.onupgradeneeded = () => r.result.createObjectStore('snapshots')
      r.onsuccess = () => resolve(r.result)
      r.onerror = () => reject(r.error)
      r.onblocked = () => reject(Error('Cierra las otras pestañas para abrir el almacenamiento.'))
    }).catch((e: unknown) => { this.db = undefined; throw e })
    return this.db
  }
  load = async () => {
    try {
      const db = await this.open()
      const data = await new Promise<TeamsSnapshot>((resolve, reject) => {
        const tx = db.transaction('snapshots', 'readwrite'), store = tx.objectStore('snapshots')
        const r = store.get('current')
        let value: TeamsSnapshot
        r.onsuccess = () => { try { value = r.result === undefined ? createTeamsDemo() : validate(r.result); if (r.result === undefined) store.put(value, 'current') } catch { tx.abort() } }
        tx.oncomplete = () => resolve(value)
        tx.onabort = tx.onerror = () => reject(Error('No se pudieron leer los datos W4. Puedes reintentar o reiniciar esta demo.'))
      })
      this.publish({ status: 'ready', data })
    } catch (e) { this.publish({ status: 'error', message: e instanceof Error ? e.message : 'Almacenamiento no disponible.' }) }
  }
  private async mutate(actor?: string, players?: string[], command?: TeamCommand) {
    try {
      const db = await this.open()
      const result = await new Promise<{ ok: boolean; error?: string }>((resolve, reject) => {
        const tx = db.transaction('snapshots', 'readwrite'), store = tx.objectStore('snapshots')
        const r = store.get('current')
        let result: { ok: boolean; error?: string } = { ok: false }
        r.onsuccess = () => {
          try {
            const next = command ? applyTeamCommand(validate(r.result), actor!, players!, command, crypto.randomUUID(), Date.now()) : { ok: true as const, value: createTeamsDemo() }
            if (next.ok) store.put(next.value, 'current')
            result = next.ok ? { ok: true } : next
          } catch { tx.abort() }
        }
        tx.oncomplete = () => resolve(result)
        tx.onabort = tx.onerror = () => reject(Error('No se guardó el cambio. Comprueba el almacenamiento local.'))
      })
      await this.load(); if (result.ok) this.channel?.postMessage('updated')
      return result
    } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error de almacenamiento.' } }
  }
  execute = (actor: string, players: string[], command: TeamCommand) => this.mutate(actor, players, command)
  reset = () => this.mutate()
}
