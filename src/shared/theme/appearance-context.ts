import { createContext, useContext } from 'react'
import type { Appearance } from '../../domain/models/appearance'

export interface AppearanceContextValue {
  saved: Appearance
  effective: Appearance
  dark: boolean
  warning?: string
  preview: (value: Appearance | null) => void
  save: (value: Appearance) => Promise<void>
}
export const AppearanceContext = createContext<AppearanceContextValue | null>(null)
export function useAppearance() {
  const context = useContext(AppearanceContext)
  if (!context) throw new Error('Falta AppearanceProvider')
  return context
}
