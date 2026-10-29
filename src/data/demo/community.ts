import { type CommunitySnapshot, type PlayerProfile, type Rank, type Region } from '../../domain/models/community'

function player(id: string, riotId: string, rank: Rank = 'Gold', region: Region = 'LatamSouth', style: Partial<PlayerProfile> = {}): PlayerProfile {
  return { id, revision: 0, riotId, name: riotId.split('#')[0]!, rank, region, agent: 'Omen', avatar: 'Nova', frame: 'Halo', background: 'Nebula', badges: ['Teamwork', 'Positive'], headline: 'Buena comunicación. Mejores partidas.', biography: 'Juego para mejorar y conocer gente con buena actitud. Me gusta coordinar al equipo y celebrar cada pequeña victoria.', ...style }
}
export const demoCandidateIds = ['candidate-1', 'candidate-2', 'candidate-3', 'candidate-4', 'candidate-5']
export function createDemoSnapshot(): CommunitySnapshot {
  return {
    profiles: [
      player('demo-me', 'LosFichas#777'),
      player('host-1', 'Vega#SUR', 'Gold', 'LatamSouth', { agent: 'Sage', avatar: 'Orbit', background: 'Ocean' }),
      player('host-2', 'Nox#NORTE', 'Platinum', 'LatamNorth', { agent: 'Sova', avatar: 'Sentinel', background: 'Graphite', frame: 'Double' }),
      player('host-3', 'Mika#EU', 'Silver', 'Europe', { agent: 'Killjoy', avatar: 'Fox', background: 'Sunset' }),
      player('host-4', 'Sol#BR', 'Unranked', 'Brazil', { agent: 'Raze', avatar: 'Orbit', background: 'Sunset' }),
      player('host-5', 'Raven#NA', 'Diamond', 'NorthAmerica', { agent: 'Jett', avatar: 'Sentinel' }),
      player('candidate-1', 'Luna#LAS', 'Gold', 'LatamSouth', { agent: 'Sage', avatar: 'Orbit' }),
      player('candidate-2', 'Echo#CL', 'Platinum', 'LatamSouth', { avatar: 'Sentinel', background: 'Ocean' }),
      player('candidate-3', 'Kira#VAL', 'Silver', 'LatamSouth', { avatar: 'Fox' }),
      player('candidate-4', 'Atlas#GG', 'Diamond'), player('candidate-5', 'Sora#PLAY'),
      player('friend-1', 'Astra#DEMO'), player('friend-2', 'Rook#DEMO'), player('friend-3', 'Pixel#DEMO'),
    ],
    posts: [
      { id: 'demo-duo', ownerId: 'host-1', title: 'Un dúo con buena comunicación', description: 'Busco compañía para ranked. Jugamos con calma, micrófono y ganas de mejorar.', rank: 'Gold', region: 'LatamSouth', mode: 'Competitive', capacity: 2, memberIds: ['host-1'] },
      { id: 'demo-night', ownerId: 'host-2', title: 'Rankeds de noche, cero tilt', description: 'Nos faltan dos para completar el equipo. Buen ambiente y comunicación en español.', rank: 'Platinum', region: 'LatamNorth', mode: 'Competitive', capacity: 5, memberIds: ['host-2', 'friend-1', 'friend-2'] },
      { id: 'demo-casual', ownerId: 'host-3', title: 'Unas partidas sin presión', description: 'Aprendemos agentes nuevos y compartimos buenas partidas. Todos los roles son bienvenidos.', rank: 'Silver', region: 'Europe', mode: 'Unrated', capacity: 5, memberIds: ['host-3'] },
      { id: 'demo-swift', ownerId: 'host-4', title: 'Poco tiempo, buenas partidas', description: 'Unas rápidas para desconectar. No importa el nivel, solo las ganas de jugar juntos.', rank: 'Unranked', region: 'Brazil', mode: 'Swiftplay', capacity: 3, memberIds: ['host-4'] },
      { id: 'demo-full', ownerId: 'host-5', title: 'Equipo de práctica', description: 'Sesión para practicar comunicación y coordinación. Este grupo ya está completo.', rank: 'Diamond', region: 'NorthAmerica', mode: 'Competitive', capacity: 2, memberIds: ['host-5', 'friend-3'] },
      { id: 'demo-owned', ownerId: 'demo-me', title: 'Mi equipo para esta noche', description: 'Busco compañeros con buena actitud. Coordinamos roles y aprendemos en equipo.', rank: 'Gold', region: 'LatamSouth', mode: 'Competitive', capacity: 3, memberIds: ['demo-me'] },
    ],
    requests: [
      { id: 'demo-request-1', postId: 'demo-owned', applicantId: 'candidate-1', status: 'Pending' },
      { id: 'demo-request-2', postId: 'demo-owned', applicantId: 'candidate-2', status: 'Pending' },
    ],
  }
}

// Historical Android demo reviews. They never stand for real player feedback.
export const demoReputation = {
  communication: 96, teamwork: 94, attitude: 98,
  reviews: [
    { authorId: 'candidate-1', stars: 5, comment: 'Muy mala comunicación. Siempre baitea al equipo y roba la calma.' },
    { authorId: 'candidate-2', stars: 5, comment: 'Un gusto jugar juntos. Coordina las rondas y comparte buenas ideas.' },
    { authorId: 'candidate-3', stars: 4, comment: 'Buen compañero, con ganas de aprender y mejorar en cada partida.' },
  ],
}
