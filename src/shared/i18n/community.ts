import type { CommunityError } from '../../domain/models/community'

export const labels = {
  Unranked: 'Sin rango', Iron: 'Hierro', Bronze: 'Bronce', Silver: 'Plata', Gold: 'Oro', Platinum: 'Platino', Diamond: 'Diamante', Ascendant: 'Ascendente', Immortal: 'Inmortal', Radiant: 'Radiante', Any: 'Cualquier rango',
  LatamNorth: 'LATAM Norte', LatamSouth: 'LATAM Sur', Brazil: 'Brasil', NorthAmerica: 'Norteamérica', Europe: 'Europa', AsiaPacific: 'Asia-Pacífico', Korea: 'Corea',
  Competitive: 'Competitivo', Unrated: 'Normal', Swiftplay: 'Swiftplay', SpikeRush: 'Spike Rush', TeamDeathmatch: 'Deathmatch por equipos',
  Duo: 'Dúo', Trio: 'Trío', Stack: 'Stack', Pending: 'Pendiente', Accepted: 'Aceptada', Rejected: 'Rechazada',
  Duelist: 'Duelista', Initiator: 'Iniciador', Controller: 'Controlador',
  Nova: 'Nova', Orbit: 'Órbita', Fox: 'Zorro', Sentinel: 'Centinela', None: 'Sin marco', Halo: 'Halo', Double: 'Doble',
  Nebula: 'Nebulosa', Ocean: 'Océano', Sunset: 'Atardecer', Graphite: 'Grafito',
  Teamwork: 'En equipo', Strategist: 'Estratega', Positive: 'Buena actitud', Explorer: 'Explorador',
} as const
export const communityErrors: Record<CommunityError, string> = {
  Invalid: 'Revisa los campos del formulario.', NotFound: 'No encontramos ese contenido en la demo local.',
  Forbidden: 'Esta acción solo está disponible para el propietario.', Full: 'Este grupo ya no tiene cupos disponibles.',
  AlreadyMember: 'Ya formas parte de este grupo.', DuplicateRequest: 'Ya existe una solicitud tuya para esta publicación.',
  Resolved: 'Esta solicitud ya fue resuelta.', NoCandidates: 'Ya probaste todos los candidatos de demostración para esta publicación.',
  Storage: 'No se pudieron guardar o leer los datos locales. Comprueba el almacenamiento del navegador e inténtalo de nuevo.',
  Conflict: 'Tu perfil cambió en otra pestaña. Vuelve al perfil y abre el editor para cargar la última versión.',
}
