import { useMemo, useState } from 'react'
import { agentRoles, searchAgentRoster, roleOfAgent, type AgentRole } from '../../domain/models/agents'
import { labels } from '../../shared/i18n/community'
import { Icon } from '../../shared/ui/Icon'

interface Props {
  value: string
  onSelect: (agent: string) => void
  invalid?: boolean
}

/** Tono por rol para dar identidad visual sin usar recursos de Riot. */
const roleTone: Record<AgentRole, string> = {
  Duelist: 'duelist',
  Initiator: 'initiator',
  Controller: 'controller',
  Sentinel: 'sentinel',
}

/**
 * Selector visual de agente principal: búsqueda por nombre y filtro por rol
 * sobre el roster completo de VALORANT. Sin imágenes de Riot: cada casilla es
 * un monograma estilizado con el nombre y el rol del agente.
 */
export function AgentPicker({ value, onSelect, invalid }: Props) {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<AgentRole | null>(null)
  const results = useMemo(() => searchAgentRoster(query, role ?? undefined), [query, role])
  const selectedRole = roleOfAgent(value)

  return <div className={`agent-picker ${invalid ? 'agent-picker-invalid' : ''}`}>
    <div className="agent-picker-controls">
      <span className="input-with-icon agent-search">
        <Icon name="search" />
        <input type="search" value={query} placeholder="Buscar agente…" aria-label="Buscar agente por nombre" onChange={(event) => setQuery(event.target.value)} />
      </span>
      <div className="agent-role-filter" role="group" aria-label="Filtrar por rol">
        <button type="button" className={`chip chip-toggle ${role === null ? 'selected' : ''}`} aria-pressed={role === null} onClick={() => setRole(null)}>Todos</button>
        {agentRoles.map((value2) => <button key={value2} type="button" className={`chip chip-toggle ${role === value2 ? 'selected' : ''}`} aria-pressed={role === value2} onClick={() => setRole(value2)}>{labels[value2]}</button>)}
      </div>
    </div>

    {value && <p className="agent-selected-summary">Agente principal: <strong>{value}</strong>{selectedRole ? ` · ${labels[selectedRole]}` : ''}</p>}

    {results.length === 0
      ? <p className="agent-empty">Ningún agente coincide con «{query}». Prueba con otro nombre o quita el filtro de rol.</p>
      : <div className="agent-grid" role="group" aria-label="Agentes de VALORANT">
          {results.map((agent) => {
            const selected = agent.name === value
            return <button
              key={agent.name}
              type="button"
              aria-pressed={selected}
              aria-label={`${agent.name}, ${labels[agent.role]}`}
              className={`agent-cell ${roleTone[agent.role]} ${selected ? 'selected' : ''}`}
              onClick={() => onSelect(agent.name)}
            >
              <span className="agent-monogram" aria-hidden="true">{agent.name.slice(0, 2).toUpperCase()}</span>
              <span className="agent-cell-name">{agent.name}</span>
              <span className="agent-cell-role">{labels[agent.role]}</span>
              {selected && <Icon name="check" className="agent-cell-check" />}
            </button>
          })}
        </div>}
  </div>
}
