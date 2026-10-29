import type { Appearance } from '../../domain/models/appearance'

const rgb = (hex: string) => [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)) as [number, number, number]
const hex = (values: number[]) => '#' + values.map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')
export function mix(a: string, b: string, ratio: number) {
  const right = rgb(b)
  return hex(rgb(a).map((v, i) => v + (right[i]! - v) * ratio))
}
export function luminance(color: string) {
  const linear = rgb(color).map((v) => v / 255).map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722
}
export function contrast(a: string, b: string) {
  const x = luminance(a), y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
function readableAccent(accent: string, backgrounds: string[], dark: boolean) {
  let color = accent
  // Margen sobre 4.5:1 porque el valor final se redondea a 6 dígitos HEX.
  for (let i = 0; i < 100 && backgrounds.some((bg) => contrast(color, bg) < 4.6); i++) color = mix(color, dark ? '#FFFFFF' : '#000000', 0.08)
  return color
}

export function themeTokens(appearance: Appearance, dark: boolean): Record<string, string> {
  const backgrounds = { classic: '#0F1923', legacy: '#17171C', crimson: '#1B1019', ocean: '#0B1C2B' }
  const background = dark ? backgrounds[appearance.palette] : '#F7F4EF'
  const surface = dark ? mix(background, '#345064', 0.16) : '#FFFFFF'
  const raised = dark ? mix(background, '#345064', 0.30) : '#E8E5DF'
  const accent = appearance.accent
  return {
    '--background': background, '--surface': surface, '--raised': raised,
    '--text': dark ? '#ECE8E1' : '#0F1923', '--muted': dark ? '#C4CDD5' : '#46535E',
    '--accent': accent, '--accent-text': readableAccent(accent, [surface, raised, background], dark),
    '--on-accent': contrast(accent, '#000000') > contrast(accent, '#FFFFFF') ? '#000000' : '#FFFFFF',
    '--border': dark ? '#344653' : '#C8CDD1', '--danger': dark ? '#FFA2AB' : '#A51B31',
    '--shadow': dark ? '0 12px 36px #00000030' : '0 10px 30px #0f19230c',
    '--hero-start': mix(background, accent, dark ? 0.20 : 0.09),
  }
}
