/**
 * Roster completo de agentes jugables de VALORANT (30 agentes, octubre 2026).
 *
 * Solo se almacenan nombre y rol: son metadatos factuales públicos. No se usan
 * imágenes ni recursos de Riot. Para incorporar un agente basta con añadir una
 * entrada a `agentRoster`; el selector, el perfil y las validaciones lo recogen
 * automáticamente.
 *
 * Fuentes: lista oficial playvalorant.com/agents y notas de parche 2026.
 * - Hush: Duelist, incorporada el 27/10/2026.
 * - Miks: Controller, incorporada en marzo de 2026.
 */
export const agentRoles = ['Duelist', 'Initiator', 'Controller', 'Sentinel'] as const
export type AgentRole = typeof agentRoles[number]

export interface AgentEntry {
  name: string
  role: AgentRole
}

export const agentRoster: readonly AgentEntry[] = [
  // Duelists
  { name: 'Phoenix', role: 'Duelist' },
  { name: 'Jett', role: 'Duelist' },
  { name: 'Raze', role: 'Duelist' },
  { name: 'Reyna', role: 'Duelist' },
  { name: 'Yoru', role: 'Duelist' },
  { name: 'Neon', role: 'Duelist' },
  { name: 'Iso', role: 'Duelist' },
  { name: 'Waylay', role: 'Duelist' },
  { name: 'Hush', role: 'Duelist' },
  // Initiators
  { name: 'Sova', role: 'Initiator' },
  { name: 'Breach', role: 'Initiator' },
  { name: 'Skye', role: 'Initiator' },
  { name: 'KAY/O', role: 'Initiator' },
  { name: 'Fade', role: 'Initiator' },
  { name: 'Gekko', role: 'Initiator' },
  { name: 'Tejo', role: 'Initiator' },
  // Controllers
  { name: 'Brimstone', role: 'Controller' },
  { name: 'Omen', role: 'Controller' },
  { name: 'Viper', role: 'Controller' },
  { name: 'Astra', role: 'Controller' },
  { name: 'Harbor', role: 'Controller' },
  { name: 'Clove', role: 'Controller' },
  { name: 'Miks', role: 'Controller' },
  // Sentinels
  { name: 'Sage', role: 'Sentinel' },
  { name: 'Cypher', role: 'Sentinel' },
  { name: 'Killjoy', role: 'Sentinel' },
  { name: 'Chamber', role: 'Sentinel' },
  { name: 'Deadlock', role: 'Sentinel' },
  { name: 'Vyse', role: 'Sentinel' },
  { name: 'Veto', role: 'Sentinel' },
]

/** Nombres en el orden del roster; se usa para validar el agente del perfil. */
export const agentNames: readonly string[] = agentRoster.map((agent) => agent.name)

const roleIndex = new Map<AgentRole, number>(agentRoles.map((role, index) => [role, index]))
export function roleOfAgent(name: string): AgentRole | undefined {
  return agentRoster.find((agent) => agent.name === name)?.role
}

/** Ordena agentes por rol (definido en `agentRoles`) y luego alfabéticamente. */
export function sortAgentsByName(list: readonly AgentEntry[]): AgentEntry[] {
  return [...list].sort((a, b) => (roleIndex.get(a.role) ?? 99) - (roleIndex.get(b.role) ?? 99) || a.name.localeCompare(b.name))
}

export function searchAgentRoster(query: string, role?: AgentRole): AgentEntry[] {
  const normalized = query.trim().toLowerCase()
  return sortAgentsByName(agentRoster.filter((agent) => {
    const matchesRole = !role || agent.role === role
    const matchesQuery = !normalized || agent.name.toLowerCase().includes(normalized)
    return matchesRole && matchesQuery
  }))
}
