import { defaultAppearance, isHexColor, normalizeHex, type Appearance } from '../../domain/models/appearance'
import type { PreferencesRepository } from '../../domain/repositories/preferences'

export const appearanceStorageKey = 'teamval.appearance.v1'

export const localPreferencesRepository: PreferencesRepository = {
  load() {
    try {
      const raw = localStorage.getItem(appearanceStorageKey)
      if (!raw) return { appearance: defaultAppearance }
      const data: unknown = JSON.parse(raw)
      if (typeof data !== 'object' || !data || !('version' in data) || data.version !== 1 || !('appearance' in data)) throw new Error('Version')
      const a = data.appearance as Partial<Appearance> | null
      if (!a || !['dark', 'light', 'system'].includes(a.mode ?? '') || !isHexColor(a.accent ?? '') || !['plain', 'aurora', 'stars'].includes(a.background ?? '') || !['classic', 'legacy', 'crimson', 'ocean'].includes(a.palette ?? '')) throw new Error('Format')
      return { appearance: { ...a, accent: normalizeHex(a.accent!) } as Appearance }
    } catch {
      return { appearance: defaultAppearance, warning: 'No se pudo leer la apariencia guardada. Estás viendo el estilo predeterminado; puedes volver a guardarlo desde Apariencia.' }
    }
  },
  async save(appearance) {
    localStorage.setItem(appearanceStorageKey, JSON.stringify({ version: 1, appearance }))
  },
}
