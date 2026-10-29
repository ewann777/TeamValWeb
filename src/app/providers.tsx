import { useCallback, useLayoutEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import type { Appearance } from '../domain/models/appearance'
import type { PreferencesRepository } from '../domain/repositories/preferences'
import { AppearanceContext } from '../shared/theme/appearance-context'
import { themeTokens } from '../shared/theme/colors'

function subscribeSystem(callback: () => void) {
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}
const systemSnapshot = () => window.matchMedia('(prefers-color-scheme: dark)').matches

export function AppearanceProvider({ children, repository }: { children: ReactNode; repository: PreferencesRepository }) {
  const [initial] = useState(() => repository.load())
  const [saved, setSaved] = useState(initial.appearance)
  const [draft, setDraft] = useState<Appearance | null>(null)
  const [warning, setWarning] = useState(initial.warning)
  const location = useLocation()
  const effective = location.pathname === '/app/apariencia' && draft ? draft : saved
  const systemDark = useSyncExternalStore(subscribeSystem, systemSnapshot)
  const dark = effective.mode === 'system' ? systemDark : effective.mode === 'dark'
  const preview = useCallback((value: Appearance | null) => setDraft(value), [])
  const save = useCallback(async (value: Appearance) => {
    await repository.save(value)
    setSaved(value)
    setWarning(undefined)
  }, [repository])

  useLayoutEffect(() => {
    const root = document.documentElement
    Object.entries(themeTokens(effective, dark)).forEach(([name, value]) => root.style.setProperty(name, value))
    root.dataset.theme = dark ? 'dark' : 'light'
    root.style.colorScheme = dark ? 'dark' : 'light'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeTokens(effective, dark)['--background']!)
  }, [effective, dark])

  return <AppearanceContext.Provider value={{ saved, effective, dark, warning, preview, save }}>{children}</AppearanceContext.Provider>
}
