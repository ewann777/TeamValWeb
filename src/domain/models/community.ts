import { agentNames } from './agents'

export const ranks = ['Unranked', 'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'] as const
export const regions = ['LatamNorth', 'LatamSouth', 'Brazil', 'NorthAmerica', 'Europe', 'AsiaPacific', 'Korea'] as const
export const gameModes = ['Competitive', 'Unrated', 'Swiftplay', 'SpikeRush', 'TeamDeathmatch'] as const
export const avatars = ['Nova', 'Orbit', 'Fox', 'Sentinel'] as const
export const frames = ['None', 'Halo', 'Double'] as const
export const profileBackgrounds = ['Nebula', 'Ocean', 'Sunset', 'Graphite'] as const
export const badges = ['Teamwork', 'Strategist', 'Positive', 'Explorer'] as const
/** Agentes jugables; procede del roster completo de VALORANT (`agents.ts`). */
export const agents = agentNames
/** Preferencia de rango de una publicación: un rango concreto o «Cualquier rango». */
export const anyRank = 'Any'
export const rankPreferences = [anyRank, ...ranks] as const
export type Rank = typeof ranks[number]
export type RankPreference = Rank | typeof anyRank
export type Region = typeof regions[number]
export type GameMode = typeof gameModes[number]
export type Category = 'Duo' | 'Trio' | 'Stack'
export type RequestStatus = 'Pending' | 'Accepted' | 'Rejected'

export interface PlayerProfile {
  id: string
  revision: number
  name: string
  riotId: string
  headline: string
  biography: string
  rank: Rank
  region: Region
  agent: typeof agents[number]
  avatar: typeof avatars[number]
  frame: typeof frames[number]
  background: typeof profileBackgrounds[number]
  badges: (typeof badges[number])[]
}

export interface StackDraft {
  title: string
  description: string
  rank: RankPreference
  region: Region
  mode: GameMode
  capacity: number
}
export interface StackPost extends StackDraft {
  id: string
  ownerId: string
  memberIds: string[]
}
export interface JoinRequest {
  id: string
  postId: string
  applicantId: string
  status: RequestStatus
}
export interface CommunitySnapshot {
  profiles: PlayerProfile[]
  posts: StackPost[]
  requests: JoinRequest[]
}
export interface StackSearch {
  category?: Category
  rankMin?: Rank
  rankMax?: Rank
  region?: Region
  mode?: GameMode
  ownOnly: boolean
  query: string
}
export type VerifiedStatsState = { status: 'unavailable'; reason: 'riot-not-connected' }
export type FieldErrors = Record<string, string>
export type CommunityError = 'Invalid' | 'NotFound' | 'Forbidden' | 'Full' | 'AlreadyMember' | 'DuplicateRequest' | 'Resolved' | 'NoCandidates' | 'Storage' | 'Conflict'
export type Result<T> = { ok: true; value: T } | { ok: false; error: CommunityError }
export const currentPlayerId = 'demo-me'
export const categoryOf = (capacity: number): Category => capacity === 2 ? 'Duo' : capacity === 3 ? 'Trio' : 'Stack'
export const slotsAvailable = (post: StackPost) => post.capacity - post.memberIds.length
/** Posición de un rango en la escala oficial; `Any` no tiene posición (acepta a todos). */
export const rankIndexOf = (rank: Rank): number => ranks.indexOf(rank)
export const initialStackDraft: StackDraft = { title: '', description: '', rank: anyRank, region: 'LatamSouth', mode: 'Competitive', capacity: 5 }
