import type { TeamCommand, TeamsSnapshot } from '../models/teams'
export type TeamsState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; data: TeamsSnapshot }
export interface TeamsRepository {
  getState(): TeamsState
  subscribe(listener: () => void): () => void
  load(): Promise<void>
  execute(actor: string, players: string[], command: TeamCommand): Promise<{ ok: boolean; error?: string }>
  reset(): Promise<{ ok: boolean; error?: string }>
}
