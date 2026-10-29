import { useOutletContext } from 'react-router-dom'
import type { PlayerProfile } from '../../domain/models/community'
import type { TeamCommand, TeamsSnapshot } from '../../domain/models/teams'
export interface TeamsContext { data: TeamsSnapshot; actor: string; players: PlayerProfile[]; busy: boolean; act: (cmd: TeamCommand, message?: string) => Promise<boolean> }
export function useTeams() { return useOutletContext<TeamsContext>() }
