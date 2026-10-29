import { ranks, regions } from '../models/community'
import { banners, divisions, ratingCategories, shapes, symbols, teamOf, type TeamCommand, type TeamDraft, type TeamResult, type TeamsSnapshot } from '../models/teams'

export function validateTeam(d: TeamDraft): string | null {
  if (d.name.trim().length < 3 || d.name.trim().length > 24) return 'El nombre debe tener entre 3 y 24 caracteres.'
  if (!/^[a-z0-9]{2,5}$/i.test(d.tag.trim())) return 'La abreviatura debe tener de 2 a 5 letras o números.'
  if (d.description.trim().length < 10 || d.description.trim().length > 300 || d.motto.length > 80) return 'Descripción: 10–300 caracteres. Lema: hasta 80.'
  if (!regions.includes(d.region) || !ranks.includes(d.rank)) return 'Selecciona región y rango válidos.'
  const i = d.identity
  if (!i || !shapes.includes(i.shape) || !symbols.includes(i.symbol) || !banners.includes(i.banner) || !['Standard', 'Spotlight'].includes(i.layout) || !['Grid', 'List'].includes(i.members)) return 'Identidad no válida.'
  if (!/^#[0-9a-f]{6}$/i.test(i.color) || !/^#[0-9a-f]{6}$/i.test(i.background) || !/^[\p{L}\p{N} ]{0,3}$/u.test(i.letters)) return 'Colores HEX válidos y hasta tres letras o números para el logo.'
  if (![i.zoom, i.x, i.y].every(Number.isFinite) || i.zoom < 1 || i.zoom > 4 || i.x < 0 || i.x > 100 || i.y < 0 || i.y > 100) return 'Recorte no válido.'
  if (i.image !== null && (!/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(i.image) || i.image.length > 2000000)) return 'Imagen no válida.'
  return null
}

/** All mutations run against the latest snapshot in one IndexedDB transaction. */
export function applyTeamCommand(original: TeamsSnapshot, actor: string, players: string[], command: TeamCommand, id: string, now: number): TeamResult {
  const fail = (error: string): TeamResult => ({ ok: false, error })
  if (!players.includes(actor)) return fail('Jugador desconocido.')
  const s = structuredClone(original)
  const mine = teamOf(s, actor)
  const captain = mine?.captain === actor
  const cmd = command
  switch (cmd.type) {
    case 'saveTeam': {
      const error = validateTeam(cmd.draft)
      if (error) return fail(error)
      const team = s.teams.find((t) => t.id === cmd.team)
      if (cmd.team && (!team || team.captain !== actor)) return fail('Solo el capitán puede editar el equipo.')
      if (team && team.revision !== cmd.revision) return fail('El equipo cambió en otra pestaña. Abre de nuevo el editor.')
      if (!cmd.team && mine) return fail('Solo puedes pertenecer a un equipo.')
      if (s.teams.some((t) => t.id !== cmd.team && (t.name.toLowerCase() === cmd.draft.name.trim().toLowerCase() || t.tag.toLowerCase() === cmd.draft.tag.trim().toLowerCase()))) return fail('Ese nombre o abreviatura ya está en uso.')
      const draft = { ...cmd.draft, name: cmd.draft.name.trim(), tag: cmd.draft.tag.trim().toUpperCase(), description: cmd.draft.description.trim(), motto: cmd.draft.motto.trim() }
      if (team) Object.assign(team, draft, { revision: team.revision + 1 })
      else s.teams.push({ ...draft, id, revision: 0, captain: actor, members: [actor] })
      break
    }
    case 'membership': {
      const t = s.teams.find((t) => t.id === cmd.team)
      if (!t || !players.includes(cmd.player)) return fail('Equipo o jugador inexistente.')
      if (cmd.kind === 'Invite' ? t.captain !== actor : cmd.player !== actor) return fail('No tienes permiso para enviar esta solicitud.')
      if (teamOf(s, cmd.player)) return fail('El jugador ya pertenece a un equipo.')
      if (t.members.length >= 7) return fail('Plantilla completa (máximo 7).')
      if (s.memberships.some((r) => r.team === t.id && r.player === cmd.player && r.status === 'Pending')) return fail('Ya existe una solicitud pendiente para este jugador.')
      s.memberships.push({ id, team: t.id, player: cmd.player, kind: cmd.kind, status: 'Pending' })
      break
    }
    case 'decideMember': {
      const r = s.memberships.find((r) => r.id === cmd.request)
      const t = s.teams.find((t) => t.id === r?.team)
      if (!r || !t || r.status !== 'Pending') return fail('Solicitud inexistente o ya resuelta.')
      const recipient = r.kind === 'Invite' ? r.player : t.captain
      const sender = r.kind === 'Invite' ? t.captain : r.player
      if (actor !== (cmd.decision === 'Cancelled' ? sender : recipient)) return fail('No tienes permiso para esta decisión.')
      if (cmd.decision === 'Accepted') {
        if (teamOf(s, r.player) || t.members.length >= 7) return fail('El jugador ya tiene equipo o no quedan plazas.')
        t.members.push(r.player); t.revision++
        s.memberships.forEach((other) => { if (other.id !== r.id && other.player === r.player && other.status === 'Pending') other.status = 'Cancelled' })
      }
      r.status = cmd.decision
      break
    }
    case 'member': {
      const t = s.teams.find((t) => t.id === cmd.team)
      if (!t || !t.members.includes(cmd.player)) return fail('Integrante inexistente.')
      if (cmd.action === 'leave' ? actor !== cmd.player : actor !== t.captain) return fail('No tienes permiso para gestionar ese integrante.')
      if (cmd.action === 'captain') {
        if (cmd.player === actor) return fail('Ese jugador ya es capitán.')
        t.captain = cmd.player
      } else {
        if (cmd.player === t.captain) return fail('Transfiere la capitanía antes de salir o retirar al capitán.')
        t.members = t.members.filter((p) => p !== cmd.player)
      }
      t.revision++
      break
    }
    case 'publish': {
      const d = cmd.draft
      if (!mine || !captain || d.team !== mine.id) return fail('Solo el capitán puede publicar.')
      if (!regions.includes(d.region) || !ranks.includes(d.rank) || !divisions.includes(d.division) || ![1, 3, 5].includes(d.bestOf) || !Number.isInteger(d.tier) || d.tier < 1 || d.tier > (['Invite', 'Contender'].includes(d.division) ? 1 : 5)) return fail('Revisa región, rango, división y modalidad.')
      if (!Number.isFinite(Date.parse(d.date)) || Date.parse(d.date) <= now) return fail('Elige una fecha y hora futuras.')
      if (d.notes.length > 300) return fail('Las notas admiten hasta 300 caracteres.')
      if (s.posts.some((p) => p.team === mine.id && p.date === d.date && p.status !== 'Closed')) return fail('Ya tienes una publicación para ese horario.')
      s.posts.push({ ...d, notes: d.notes.trim(), id, status: 'Open' })
      break
    }
    case 'closePost': {
      const p = s.posts.find((p) => p.id === cmd.post)
      if (!p || !captain || p.team !== mine?.id || p.status !== 'Open') return fail('No puedes cerrar esta publicación.')
      p.status = 'Closed'
      s.scrims.forEach((r) => { if (r.post === p.id && r.status === 'Pending') r.status = 'Cancelled' })
      break
    }
    case 'challenge': {
      const p = s.posts.find((p) => p.id === cmd.post)
      if (!mine || !captain || !p || p.team === mine.id) return fail('Solo el capitán de otro equipo puede solicitar scrim.')
      if (p.status !== 'Open' || Date.parse(p.date) <= now) return fail('Esta publicación ya no acepta solicitudes.')
      if (s.scrims.some((r) => (r.post === p.id && r.away === mine.id) || (['Pending', 'Accepted'].includes(r.status) && [r.home, r.away].includes(mine.id) && [r.home, r.away].includes(p.team)))) return fail('Ya existe un enfrentamiento o solicitud entre estos equipos.')
      s.scrims.push({ id, post: p.id, home: p.team, away: mine.id, status: 'Pending' })
      break
    }
    case 'decideScrim': {
      const r = s.scrims.find((r) => r.id === cmd.scrim)
      const p = s.posts.find((p) => p.id === r?.post)
      if (!r || !p || !mine || !captain || ![r.home, r.away].includes(mine.id)) return fail('Solo los capitanes participantes pueden decidir.')
      if (cmd.decision === 'Cancelled') {
        if (!['Pending', 'Accepted'].includes(r.status)) return fail('Este enfrentamiento ya terminó.')
        if (r.status === 'Accepted') p.status = 'Closed'
      } else {
        if (mine.id !== r.home || r.status !== 'Pending' || p.status !== 'Open') return fail('Solo el anfitrión puede resolver una solicitud pendiente.')
        if (cmd.decision === 'Accepted') {
          if (Date.parse(p.date) <= now) return fail('El horario ya pasó. Publica un nuevo horario.')
          if (s.scrims.some((o) => o.status === 'Accepted' && s.posts.find((q) => q.id === o.post)?.date === p.date && [o.home, o.away].some((t) => [r.home, r.away].includes(t)))) return fail('Uno de los equipos ya tiene una scrim a esa hora.')
          p.status = 'Matched'
          s.scrims.forEach((o) => { if (o.post === p.id && o.id !== r.id && o.status === 'Pending') o.status = 'Rejected' })
        }
      }
      r.status = cmd.decision
      break
    }
    case 'complete': {
      const r = s.scrims.find((r) => r.id === cmd.scrim)
      const p = s.posts.find((p) => p.id === r?.post)
      if (!r || !p || !mine || !captain || ![r.home, r.away].includes(mine.id) || r.status !== 'Accepted') return fail('Solo un capitán participante puede registrar el resultado de una scrim aceptada.')
      const wins = Math.ceil(p.bestOf / 2)
      if (![cmd.home, cmd.away].every((n) => Number.isInteger(n) && n >= 0 && n <= wins) || cmd.home === cmd.away || Math.max(cmd.home, cmd.away) !== wins) return fail(`Marcador por mapas: uno debe ganar ${wins}; el otro debe tener menos.`)
      r.homeScore = cmd.home; r.awayScore = cmd.away; r.status = 'Completed'; p.status = 'Closed'
      break
    }
    case 'rate': {
      const r = s.scrims.find((r) => r.id === cmd.scrim)
      if (!mine || !captain || !r || r.status !== 'Completed' || ![r.home, r.away].includes(mine.id)) return fail('Solo un capitán participante puede valorar una scrim completada.')
      if (s.ratings.some((v) => v.scrim === r.id && v.from === mine.id)) return fail('Tu equipo ya valoró este enfrentamiento.')
      if (!ratingCategories.every((k) => Number.isInteger(cmd.scores[k]) && cmd.scores[k] >= 1 && cmd.scores[k] <= 5) || typeof cmd.toxic !== 'boolean') return fail('Todas las categorías deben tener de 1 a 5 estrellas.')
      const comment = cmd.comment.trim()
      if (comment && (comment.length < 10 || comment.length > 500 || /https?:|www\.|idiota|imbécil|estafa|scam|hackeo|tramposo/i.test(comment))) return fail('Comentario opcional: 10–500 caracteres, sin enlaces ni términos bloqueados por la regla local.')
      s.ratings.push({ id, scrim: r.id, from: mine.id, to: r.home === mine.id ? r.away : r.home, scores: cmd.scores, toxic: cmd.toxic, comment, date: new Date(now).toISOString(), reports: [] })
      break
    }
    case 'report': {
      const r = s.ratings.find((r) => r.id === cmd.rating)
      if (!r || !mine || !captain || r.to !== mine.id || r.reports.includes(mine.id)) return fail('Solo el capitán receptor puede registrar una denuncia, una vez.')
      r.reports.push(mine.id)
      break
    }
  }
  return { ok: true, value: s }
}
