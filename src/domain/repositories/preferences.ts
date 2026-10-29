import type { Appearance } from '../models/appearance'

export interface PreferencesRepository {
  load(): { appearance: Appearance; warning?: string }
  save(appearance: Appearance): Promise<void>
}
