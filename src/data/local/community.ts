import { currentPlayerId, slotsAvailable, type CommunitySnapshot, type PlayerProfile, type Result, type StackDraft } from '../../domain/models/community'
import type { CommunityRepository, CommunityState } from '../../domain/repositories/community'
import { createPost, isCommunitySnapshot, normalizeProfile, requestJoin, resolveJoin, validateProfile } from '../../domain/rules/community'
import { createDemoSnapshot, demoCandidateIds } from '../demo/community'

export const communityStorageKey = 'teamval.community.demo.v1'
interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void }
interface LocalPorts {
  storage: () => StoragePort
  exclusive: <T>(operation: () => Promise<T>) => Promise<T>
  id: () => string
  onExternalChange?: (listener: () => void) => () => void
}

/** One versioned snapshot and Web Lock keep decisions/capacity consistent across tabs. */
export class LocalCommunityRepository implements CommunityRepository {
  private state: CommunityState = { status: 'loading' }
  private listeners = new Set<() => void>()
  constructor(private ports: LocalPorts) {}
  getState = () => this.state
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    const off = this.ports.onExternalChange?.(() => { void this.load() })
    return () => { this.listeners.delete(listener); off?.() }
  }
  private publish(state: CommunityState) {
    this.state = state
    this.listeners.forEach((listener) => listener())
  }
  private read(): CommunitySnapshot {
    const raw = this.ports.storage().getItem(communityStorageKey)
    if (!raw) return createDemoSnapshot()
    const data: unknown = JSON.parse(raw)
    if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1 || !('snapshot' in data) || !isCommunitySnapshot(data.snapshot) || !data.snapshot.profiles.some((p) => p.id === currentPlayerId)) throw new Error('Invalid local data')
    return data.snapshot
  }
  load = async () => {
    try { this.publish({ status: 'ready', data: this.read() }) }
    catch { this.publish({ status: 'error' }) }
  }
  private async mutate(operation: (state: CommunitySnapshot) => Result<CommunitySnapshot>, value: string): Promise<Result<string>> {
    try {
      return await this.ports.exclusive(async () => {
        const current = this.read()
        const next = operation(current)
        if (!next.ok) { this.publish({ status: 'ready', data: current }); return next }
        this.ports.storage().setItem(communityStorageKey, JSON.stringify({ version: 1, snapshot: next.value }))
        this.publish({ status: 'ready', data: next.value })
        return { ok: true, value }
      })
    } catch { return { ok: false, error: 'Storage' } }
  }
  create = (draft: StackDraft) => {
    const id = this.ports.id()
    return this.mutate((state) => createPost(state, currentPlayerId, draft, id), id)
  }
  join = (postId: string) => {
    const id = this.ports.id()
    return this.mutate((state) => requestJoin(state, currentPlayerId, postId, id), id)
  }
  simulate = (postId: string) => {
    const id = this.ports.id()
    return this.mutate((state) => {
      const post = state.posts.find((p) => p.id === postId)
      if (!post) return { ok: false, error: 'NotFound' }
      if (post.ownerId !== currentPlayerId) return { ok: false, error: 'Forbidden' }
      if (!slotsAvailable(post)) return { ok: false, error: 'Full' }
      const candidate = demoCandidateIds.find((candidateId) => state.profiles.some((p) => p.id === candidateId) && !post.memberIds.includes(candidateId) && !state.requests.some((r) => r.postId === postId && r.applicantId === candidateId))
      return candidate ? requestJoin(state, candidate, postId, id) : { ok: false, error: 'NoCandidates' }
    }, id)
  }
  resolve = (requestId: string, accept: boolean) => this.mutate((state) => resolveJoin(state, currentPlayerId, requestId, accept), requestId)
  saveProfile = (profile: PlayerProfile) => this.mutate((state) => {
    if (profile.id !== currentPlayerId) return { ok: false, error: 'Forbidden' }
    if (Object.keys(validateProfile(profile)).length) return { ok: false, error: 'Invalid' }
    if (state.profiles.find((p) => p.id === currentPlayerId)?.revision !== profile.revision) return { ok: false, error: 'Conflict' }
    return { ok: true, value: { ...state, profiles: state.profiles.map((p) => p.id === currentPlayerId ? { ...normalizeProfile(profile), revision: p.revision + 1 } : p) } }
  }, currentPlayerId)
  /** Reinicio de sesión demo: vuelve al fixture inicial y lo conserva persistido. */
  reset = () => this.mutate(() => ({ ok: true, value: createDemoSnapshot() }), 'reset')
}

export function createBrowserCommunityRepository() {
  return new LocalCommunityRepository({
    storage: () => localStorage,
    id: () => crypto.randomUUID(),
    exclusive: (operation) => navigator.locks ? navigator.locks.request(communityStorageKey, operation) : operation(),
    onExternalChange: (listener) => {
      const onStorage = (event: StorageEvent) => { if (event.key === communityStorageKey || event.key === null) listener() }
      window.addEventListener('storage', onStorage)
      return () => window.removeEventListener('storage', onStorage)
    },
  })
}
