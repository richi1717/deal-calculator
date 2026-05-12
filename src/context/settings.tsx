import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react'

const SETTINGS_KEY = 'dealcalc_settings'
const LEGACY_K_MODE_KEY = 'dealcalc_k_mode'

export type Settings = {
  kMode: boolean
  haircutPct: number
  commissionPct: number
  dpPct: number
  interestRate: number
  defaultProfit: number
  defaultFee: number
  showGrossYield: boolean
}

const DEFAULT_SETTINGS: Settings = {
  kMode: true,
  haircutPct: 0.07,
  commissionPct: 0.015,
  dpPct: 0.15,
  interestRate: 0.1,
  defaultProfit: 25000,
  defaultFee: 15000,
  showGrossYield: false,
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {}
  const legacyKMode = localStorage.getItem(LEGACY_K_MODE_KEY)
  return { ...DEFAULT_SETTINGS, kMode: legacyKMode !== 'false' }
}

type SettingsContextValue = {
  settings: Settings
  update: (patch: Partial<Settings>) => void
  reset: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
      return next
    })
  }

  const reset = () => {
    localStorage.removeItem(SETTINGS_KEY)
    setSettings(DEFAULT_SETTINGS)
  }

  return (
    <SettingsContext.Provider value={{ settings, update, reset }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
