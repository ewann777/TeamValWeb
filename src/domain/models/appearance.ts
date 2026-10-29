export type ThemeMode = 'dark' | 'light' | 'system'
export type BackgroundStyle = 'plain' | 'aurora' | 'stars'
export type Palette = 'classic' | 'legacy' | 'crimson' | 'ocean'

export interface Appearance {
  mode: ThemeMode
  accent: string
  background: BackgroundStyle
  palette: Palette
}

export const defaultAppearance: Appearance = {
  mode: 'dark', accent: '#FF4655', background: 'plain', palette: 'classic',
}

export const isHexColor = (value: string) => /^#?[\da-f]{6}$/i.test(value)
export const normalizeHex = (value: string) => `#${value.replace(/^#/, '').toUpperCase()}`

export const appearancePresets: { name: string; description: string; value: Appearance }[] = [
  { name: 'VALORANT clásico', description: 'La esencia de TeamVal', value: defaultAppearance },
  { name: 'Oscuro premium', description: 'Lavanda y profundidad', value: { mode: 'dark', accent: '#C4B5FD', background: 'aurora', palette: 'legacy' } },
  { name: 'Rojo intenso', description: 'Un poco más de energía', value: { mode: 'dark', accent: '#FF4655', background: 'aurora', palette: 'crimson' } },
  { name: 'Azul / carbón', description: 'Tu propio cielo', value: { mode: 'dark', accent: '#69C8FF', background: 'stars', palette: 'ocean' } },
  { name: 'Claro elegante', description: 'Una nueva perspectiva', value: { mode: 'light', accent: '#FF4655', background: 'plain', palette: 'classic' } },
]

export function equalAppearance(a: Appearance, b: Appearance) {
  return a.mode === b.mode && a.accent === b.accent && a.background === b.background && a.palette === b.palette
}
