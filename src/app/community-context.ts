import { createContext, useContext } from 'react'
import type { PlayerProfile } from '../domain/models/community'
import type { CommunityRepository, CommunityState } from '../domain/repositories/community'

export interface CommunityContextValue {
  state: CommunityState
  repository: CommunityRepository
  me: PlayerProfile | null
  profileOf: (id: string) => PlayerProfile | undefined
  retry: () => void
}

export const CommunityContext = createContext<CommunityContextValue | null>(null)

export function useCommunity() {
  const context = useContext(CommunityContext)
  if (!context) throw new Error('Falta CommunityProvider')
  return context
}
