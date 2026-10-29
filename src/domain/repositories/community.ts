import type { CommunitySnapshot, PlayerProfile, Result, StackDraft } from '../models/community'

export type CommunityState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: CommunitySnapshot }
export interface CommunityRepository {
  getState(): CommunityState
  subscribe(listener: () => void): () => void
  load(): Promise<void>
  create(draft: StackDraft): Promise<Result<string>>
  join(postId: string): Promise<Result<string>>
  simulate(postId: string): Promise<Result<string>>
  resolve(requestId: string, accept: boolean): Promise<Result<string>>
  saveProfile(profile: PlayerProfile): Promise<Result<string>>
  reset(): Promise<Result<string>>
}
