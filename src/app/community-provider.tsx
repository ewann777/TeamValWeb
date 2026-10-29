import { useCallback, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { currentPlayerId } from '../domain/models/community'
import type { CommunityRepository } from '../domain/repositories/community'
import { CommunityContext, type CommunityContextValue } from './community-context'

export function CommunityProvider({ repository, children }: { repository: CommunityRepository; children: ReactNode }) {
  const state = useSyncExternalStore(repository.subscribe, repository.getState, repository.getState)
  useEffect(() => { void repository.load() }, [repository])
  const retry = useCallback(() => { void repository.load() }, [repository])
  const value = useMemo<CommunityContextValue>(() => {
    const profileOf = (id: string) => state.status === 'ready' ? state.data.profiles.find((profile) => profile.id === id) : undefined
    return { state, repository, profileOf, me: profileOf(currentPlayerId) ?? null, retry }
  }, [state, repository, retry])
  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>
}
