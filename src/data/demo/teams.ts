import { defaultIdentity, type TeamsSnapshot } from '../../domain/models/teams'

export function createTeamsDemo(now = Date.now()): TeamsSnapshot {
  return { version: 1, teams: [
    { id: 'phoenix', revision: 0, name: 'TEAM PHOENIX', tag: 'PHX', description: 'Equipo ficticio de práctica, comunicación y buen ambiente.', motto: 'Volvemos a intentarlo juntos.', region: 'LatamSouth', rank: 'Diamond', captain: 'host-1', members: ['host-1', 'friend-1'], identity: { ...defaultIdentity, letters: 'PHX' } },
    { id: 'orbit', revision: 0, name: 'ORBIT FIVE', tag: 'ORB', description: 'Plantilla ficticia para ensayar solicitudes y enfrentamientos.', motto: 'Cada ronda cuenta.', region: 'LatamNorth', rank: 'Platinum', captain: 'host-2', members: ['host-2', 'friend-2'], identity: { ...defaultIdentity, color: '#4AA3FF', symbol: 'Orbit', letters: 'ORB' } },
  ], memberships: [], posts: [
    { id: 'phoenix-open', team: 'phoenix', region: 'LatamSouth', rank: 'Diamond', division: 'Elite', tier: 1, date: new Date(now + 86400000).toISOString(), bestOf: 3, notes: 'Buscamos rival para practicar. Publicación de demostración.', status: 'Open' },
    { id: 'orbit-open', team: 'orbit', region: 'LatamNorth', rank: 'Platinum', division: 'Advanced', tier: 3, date: new Date(now + 172800000).toISOString(), bestOf: 1, notes: 'Una partida de práctica sin presión.', status: 'Open' },
  ], scrims: [], ratings: [] }
}
