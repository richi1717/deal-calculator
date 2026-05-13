import { createContext, useContext } from 'react'

export type SettingsDrawerContextValue = {
  isOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

export const SettingsDrawerContext =
  createContext<SettingsDrawerContextValue | null>(null)

export function useSettingsDrawer() {
  const ctx = useContext(SettingsDrawerContext)
  if (!ctx) throw new Error('useSettingsDrawer must be used within AppShell')
  return ctx
}
