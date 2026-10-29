import { test, expect } from '@playwright/test'
import { createTeamsDemo } from '../../src/data/demo/teams'
import { createDemoSnapshot } from '../../src/data/demo/community'
import { applyTeamCommand, validateTeam } from '../../src/domain/rules/teams'
import { emptyTeam, type TeamCommand, type TeamsSnapshot } from '../../src/domain/models/teams'

const now = Date.now(), players = createDemoSnapshot().profiles.map((p) => p.id)
const draft = { ...emptyTeam, name: 'Equipo nuevo', tag: 'NEW', description: 'Equipo de demostración para probar.' }
function apply(s: TeamsSnapshot, actor: string, cmd: TeamCommand, id = 'new') { return applyTeamCommand(s, actor, players, cmd, id, now) }
function next(s: TeamsSnapshot, actor: string, cmd: TeamCommand, id = 'new') { const r = apply(s, actor, cmd, id); if (!r.ok) throw Error(r.error); return r.value }
function requested() { return next(createTeamsDemo(now), 'host-2', { type: 'challenge', post: 'phoenix-open' }, 'match') }
function accepted() { return next(requested(), 'host-1', { type: 'decideScrim', scrim: 'match', decision: 'Accepted' }) }
const scores = { Communication: 5, Respect: 4, Sportsmanship: 5, Seriousness: 4, Punctuality: 3 }

test('equipo: creación normalizada y un equipo por jugador', () => {
  const s = next(createTeamsDemo(now), 'demo-me', { type: 'saveTeam', draft })
  expect(s.teams[2]!.captain).toBe('demo-me')
  expect(apply(s, 'demo-me', { type: 'saveTeam', draft }).ok).toBe(false)
  expect(apply(s, 'candidate-1', { type: 'saveTeam', draft }).ok).toBe(false)
})
test('equipo: validación de texto, color, imagen y recorte', () => {
  expect(validateTeam(draft)).toBeNull()
  expect(validateTeam({ ...draft, description: 'x' })).toBeTruthy()
  expect(validateTeam({ ...draft, identity: { ...draft.identity, color: 'red' } })).toBeTruthy()
  expect(validateTeam({ ...draft, identity: { ...draft.identity, image: 'data:image/svg+xml,<svg/>' } })).toBeTruthy()
  expect(validateTeam({ ...draft, identity: { ...draft.identity, zoom: 5 } })).toBeTruthy()
})
test('equipo: edición solo capitán y bloqueo de revisiones obsoletas', () => {
  const s = createTeamsDemo(now), t = s.teams[0]!
  expect(apply(s, 'friend-1', { type: 'saveTeam', draft: t, team: t.id, revision: 0 }).ok).toBe(false)
  const updated = next(s, 'host-1', { type: 'saveTeam', draft: { ...t, name: 'Nombre nuevo' }, team: t.id, revision: 0 })
  expect(apply(updated, 'host-1', { type: 'saveTeam', draft: t, team: t.id, revision: 0 }).ok).toBe(false)
})
test('invitación: duplicado, destinatario y resolución terminal', () => {
  const cmd: TeamCommand = { type: 'membership', team: 'phoenix', player: 'candidate-1', kind: 'Invite' }
  const s = next(createTeamsDemo(now), 'host-1', cmd, 'invite')
  expect(apply(s, 'host-1', cmd).ok).toBe(false)
  expect(apply(s, 'host-1', { type: 'decideMember', request: 'invite', decision: 'Accepted' }).ok).toBe(false)
  const joined = next(s, 'candidate-1', { type: 'decideMember', request: 'invite', decision: 'Accepted' })
  expect(joined.teams[0]!.members).toContain('candidate-1')
  expect(apply(joined, 'candidate-1', { type: 'decideMember', request: 'invite', decision: 'Rejected' }).ok).toBe(false)
})
test('ingreso: permiso del capitán, rechazo y cancelación del solicitante', () => {
  let s = next(createTeamsDemo(now), 'demo-me', { type: 'membership', team: 'phoenix', player: 'demo-me', kind: 'Join' }, 'join')
  expect(apply(s, 'demo-me', { type: 'decideMember', request: 'join', decision: 'Accepted' }).ok).toBe(false)
  s = next(s, 'host-1', { type: 'decideMember', request: 'join', decision: 'Rejected' })
  expect(s.teams[0]!.members).not.toContain('demo-me')
  s = next(s, 'demo-me', { type: 'membership', team: 'orbit', player: 'demo-me', kind: 'Join' }, 'join2')
  expect(next(s, 'demo-me', { type: 'decideMember', request: 'join2', decision: 'Cancelled' }).memberships[1]!.status).toBe('Cancelled')
})
test('ingreso: aceptar cancela otras invitaciones y evita membresía doble', () => {
  let s = next(createTeamsDemo(now), 'demo-me', { type: 'membership', team: 'phoenix', player: 'demo-me', kind: 'Join' }, 'a')
  s = next(s, 'host-2', { type: 'membership', team: 'orbit', player: 'demo-me', kind: 'Invite' }, 'b')
  s = next(s, 'host-1', { type: 'decideMember', request: 'a', decision: 'Accepted' })
  expect(s.memberships[1]!.status).toBe('Cancelled')
  expect(apply(s, 'demo-me', { type: 'decideMember', request: 'b', decision: 'Accepted' }).ok).toBe(false)
})
test('plantilla: límite de siete se comprueba al aceptar', () => {
  const s = next(createTeamsDemo(now), 'demo-me', { type: 'membership', team: 'phoenix', player: 'demo-me', kind: 'Join' }, 'join')
  s.teams[0]!.members.push('candidate-1', 'candidate-2', 'candidate-3', 'candidate-4', 'candidate-5')
  expect(apply(s, 'host-1', { type: 'decideMember', request: 'join', decision: 'Accepted' }).ok).toBe(false)
})
test('plantilla: transferencia, retirada y salida sin equipo huérfano', () => {
  const s = createTeamsDemo(now)
  expect(apply(s, 'host-1', { type: 'member', team: 'phoenix', player: 'host-1', action: 'leave' }).ok).toBe(false)
  const transferred = next(s, 'host-1', { type: 'member', team: 'phoenix', player: 'friend-1', action: 'captain' })
  expect(transferred.teams[0]!.captain).toBe('friend-1')
  expect(apply(transferred, 'host-1', { type: 'member', team: 'phoenix', player: 'friend-1', action: 'remove' }).ok).toBe(false)
  expect(next(transferred, 'friend-1', { type: 'member', team: 'phoenix', player: 'host-1', action: 'remove' }).teams[0]!.members).toEqual(['friend-1'])
})
test('publicación: futuro, división, grupos y permisos', () => {
  const s = createTeamsDemo(now), draft = { ...s.posts[0]!, date: new Date(now + 3600000).toISOString() }
  expect(apply(s, 'friend-1', { type: 'publish', draft }).ok).toBe(false)
  expect(apply(s, 'host-1', { type: 'publish', draft: { ...draft, date: new Date(now - 1).toISOString() } }).ok).toBe(false)
  expect(apply(s, 'host-1', { type: 'publish', draft: { ...draft, division: 'Invite', tier: 2 } }).ok).toBe(false)
  expect(apply(s, 'host-1', { type: 'publish', draft }).ok).toBe(true)
})
test('scrims: impedir rival propio, no capitán y duplicados en ambos sentidos', () => {
  const s = createTeamsDemo(now)
  expect(apply(s, 'host-1', { type: 'challenge', post: 'phoenix-open' }).ok).toBe(false)
  expect(apply(s, 'friend-2', { type: 'challenge', post: 'phoenix-open' }).ok).toBe(false)
  const r = requested()
  expect(apply(r, 'host-2', { type: 'challenge', post: 'phoenix-open' }).ok).toBe(false)
  expect(apply(r, 'host-1', { type: 'challenge', post: 'orbit-open' }).ok).toBe(false)
})
test('scrims: solo anfitrión acepta/rechaza; cancelar es terminal', () => {
  const s = requested()
  expect(apply(s, 'host-2', { type: 'decideScrim', scrim: 'match', decision: 'Accepted' }).ok).toBe(false)
  const rejected = next(s, 'host-1', { type: 'decideScrim', scrim: 'match', decision: 'Rejected' })
  expect(apply(rejected, 'host-1', { type: 'decideScrim', scrim: 'match', decision: 'Accepted' }).ok).toBe(false)
  const cancelled = next(accepted(), 'host-2', { type: 'decideScrim', scrim: 'match', decision: 'Cancelled' })
  expect(cancelled.posts[0]!.status).toBe('Closed')
  expect(apply(cancelled, 'host-1', { type: 'complete', scrim: 'match', home: 2, away: 1 }).ok).toBe(false)
})
test('scrims: cerrar publicación cancela propuestas', () => {
  const s = next(requested(), 'host-1', { type: 'closePost', post: 'phoenix-open' })
  expect(s.scrims[0]!.status).toBe('Cancelled')
  expect(apply(s, 'host-2', { type: 'challenge', post: 'phoenix-open' }).ok).toBe(false)
})
test('resultado manual: solo aceptada, capitán y marcador por mapas válido', () => {
  const cmd: TeamCommand = { type: 'complete', scrim: 'match', home: 2, away: 1 }
  expect(apply(requested(), 'host-1', cmd).ok).toBe(false)
  expect(apply(accepted(), 'friend-1', cmd).ok).toBe(false)
  expect(apply(accepted(), 'host-1', { ...cmd, away: 2 }).ok).toBe(false)
  expect(apply(accepted(), 'host-1', { ...cmd, home: 13 }).ok).toBe(false)
  expect(next(accepted(), 'host-1', cmd).scrims[0]!.status).toBe('Completed')
})
test('reputación: única por equipo, solo tras completar, sin autovaloración', () => {
  const cmd: TeamCommand = { type: 'rate', scrim: 'match', scores, toxic: false, comment: '' }
  expect(apply(accepted(), 'host-1', cmd).ok).toBe(false)
  const completed = next(accepted(), 'host-1', { type: 'complete', scrim: 'match', home: 2, away: 1 })
  expect(apply(completed, 'friend-1', cmd).ok).toBe(false)
  expect(apply(completed, 'demo-me', cmd).ok).toBe(false)
  const rated = next(completed, 'host-1', cmd, 'rating')
  expect(rated.ratings[0]!.to).toBe('orbit')
  expect(apply(rated, 'host-1', cmd).ok).toBe(false)
  expect(apply(rated, 'host-2', cmd).ok).toBe(true)
  expect(apply(rated, 'host-2', { ...cmd, comment: 'https://example.com' }).ok).toBe(false)
  expect(apply(rated, 'host-2', { ...cmd, scores: { ...scores, Respect: 0 } }).ok).toBe(false)
})
test('denuncia: receptor capitán, solo una, sin moderación remota', () => {
  let s = next(accepted(), 'host-1', { type: 'complete', scrim: 'match', home: 2, away: 1 })
  s = next(s, 'host-1', { type: 'rate', scrim: 'match', scores, toxic: true, comment: '' }, 'rating')
  expect(apply(s, 'host-1', { type: 'report', rating: 'rating' }).ok).toBe(false)
  s = next(s, 'host-2', { type: 'report', rating: 'rating' })
  expect(s.ratings[0]!.reports).toEqual(['orbit'])
  expect(apply(s, 'host-2', { type: 'report', rating: 'rating' }).ok).toBe(false)
})
