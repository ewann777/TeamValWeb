import type { Rank, Region } from './community'

// Nombres oficiales: Riot Support, Premier || Divisions (consultado 28/10/2026).
export const divisions = ['Open', 'Intermediate', 'Advanced', 'Elite', 'Contender', 'Invite'] as const
export type Division = typeof divisions[number]
export const shapes = ['Circle', 'Square', 'Shield'] as const
export const symbols = ['Star', 'Bolt', 'Diamond', 'Orbit'] as const
export const banners = ['Solid', 'Aurora', 'Grid'] as const
export interface TeamIdentity {
  shape: typeof shapes[number]; symbol: typeof symbols[number]; color: string; background: string
  letters: string; image: string | null; zoom: number; x: number; y: number
  banner: typeof banners[number]; layout: 'Standard' | 'Spotlight'; members: 'Grid' | 'List'
}
export interface TeamDraft { name: string; tag: string; description: string; motto: string; region: Region; rank: Rank; identity: TeamIdentity }
export interface Team extends TeamDraft { id: string; revision: number; captain: string; members: string[] }
export type Decision = 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled'
export interface Membership { id: string; team: string; player: string; kind: 'Invite' | 'Join'; status: Decision }
export interface ScrimDraft { team: string; region: Region; rank: Rank; division: Division; tier: number; date: string; bestOf: 1 | 3 | 5; notes: string }
export interface ScrimPost extends ScrimDraft { id: string; status: 'Open' | 'Matched' | 'Closed' }
export interface Scrim { id: string; post: string; home: string; away: string; status: Decision | 'Completed'; homeScore?: number; awayScore?: number }
export const ratingCategories = ['Communication', 'Respect', 'Sportsmanship', 'Seriousness', 'Punctuality'] as const
export type Scores = Record<typeof ratingCategories[number], number>
export interface TeamRating { id: string; scrim: string; from: string; to: string; scores: Scores; toxic: boolean; comment: string; date: string; reports: string[] }
export interface TeamsSnapshot { version: 1; teams: Team[]; memberships: Membership[]; posts: ScrimPost[]; scrims: Scrim[]; ratings: TeamRating[] }
export const defaultIdentity: TeamIdentity = { shape: 'Shield', symbol: 'Star', color: '#FF4655', background: '#0F1923', letters: 'TV', image: null, zoom: 1, x: 50, y: 50, banner: 'Aurora', layout: 'Standard', members: 'Grid' }
export const emptyTeam: TeamDraft = { name: '', tag: '', description: '', motto: '', region: 'LatamSouth', rank: 'Gold', identity: defaultIdentity }
export type TeamCommand =
  | { type: 'saveTeam'; draft: TeamDraft; team?: string; revision?: number }
  | { type: 'membership'; team: string; player: string; kind: Membership['kind'] }
  | { type: 'decideMember'; request: string; decision: Exclude<Decision, 'Pending'> }
  | { type: 'member'; team: string; player: string; action: 'remove' | 'captain' | 'leave' }
  | { type: 'publish'; draft: ScrimDraft }
  | { type: 'closePost'; post: string }
  | { type: 'challenge'; post: string }
  | { type: 'decideScrim'; scrim: string; decision: Exclude<Decision, 'Pending'> }
  | { type: 'complete'; scrim: string; home: number; away: number }
  | { type: 'rate'; scrim: string; scores: Scores; toxic: boolean; comment: string }
  | { type: 'report'; rating: string }
export type TeamResult = { ok: true; value: TeamsSnapshot } | { ok: false; error: string }
export const teamOf = (data: TeamsSnapshot, player: string) => data.teams.find((team) => team.members.includes(player))
