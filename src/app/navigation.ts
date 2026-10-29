import type { IconName } from '../shared/ui/Icon'

export const destinations: { to: string; label: string; icon: IconName }[] = [
  { to: '/app', label: 'Inicio', icon: 'home' },
  { to: '/app/buscar-equipo', label: 'Buscar equipo', icon: 'team' },
  { to: '/app/scrims', label: 'Scrims', icon: 'scrims' },
  { to: '/app/tienda', label: 'Tienda', icon: 'shop' },
  { to: '/app/perfil', label: 'Perfil', icon: 'profile' },
]

/** Título visible en la cabecera; mantiene activo el destino padre en rutas anidadas. */
export function pageTitle(pathname: string): string {
  const destination = destinations.find((item) => item.to === pathname)
  if (destination) return destination.label
  if (pathname === '/app/apariencia') return 'Apariencia'
  if (pathname === '/app/perfil/editar') return 'Editar perfil'
  if (pathname.startsWith('/app/jugadores/')) return 'Perfil público'
  if (pathname === '/app/buscar-equipo/crear') return 'Crear publicación'
  if (pathname === '/app/buscar-equipo/solicitudes') return 'Solicitudes'
  if (pathname.startsWith('/app/buscar-equipo/publicaciones/')) return 'Publicación'
  if (pathname.startsWith('/app/scrims/equipos')) return 'Equipos'
  if (pathname.startsWith('/app/scrims/')) return 'Scrims'
  return 'Página no encontrada'
}
