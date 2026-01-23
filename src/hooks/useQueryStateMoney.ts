import { useMemo } from 'react'
import { useQueryStateNumber } from './useQueryStateNumber'

const roundTo = (n: number, decimals: number) => {
  const p = 10 ** decimals
  return Math.round((n + Number.EPSILON) * p) / p
}

export function useQueryStateMoney(
  key: string,
  defaultDollars: number,
  kMode: boolean,
  kDisplayDecimals = 1,
) {
  const [dollars, setDollars] = useQueryStateNumber(key, defaultDollars)

  const display = useMemo(() => {
    if (!kMode) return String(dollars)

    const k = dollars / 1000
    const rounded = roundTo(k, kDisplayDecimals)

    // avoid showing trailing .0 unless user typed it
    return String(rounded).replace(/\.0$/, '')
  }, [dollars, kMode, kDisplayDecimals])

  const setDisplay = (raw: string) => {
    if (raw.trim() === '') return

    const n = Number(raw)
    if (!Number.isFinite(n)) return

    const nextDollars = kMode ? n * 1000 : n
    setDollars(Math.round(nextDollars))
  }

  return { dollars, display, setDisplay }
}
