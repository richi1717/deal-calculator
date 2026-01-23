import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const roundTo = (n: number, decimals: number) => {
  const p = 10 ** decimals
  return Math.round((n + Number.EPSILON) * p) / p
}

type Options = {
  kMode: boolean
  defaultDollars: number
  key: string
  kDisplayDecimals?: number
}

export function useQueryMoneyField({
  key,
  defaultDollars,
  kMode,
  kDisplayDecimals = 1,
}: Options) {
  const [params, setParams] = useSearchParams()

  const initialRaw = useMemo(() => {
    const rawParam = params.get(key)
    const n = rawParam !== null ? Number(rawParam) : NaN
    const dollars = Number.isFinite(n) ? n : defaultDollars

    if (!kMode) return String(dollars)

    const k = dollars / 1000
    const rounded = roundTo(k, kDisplayDecimals)
    return String(rounded).replace(/\.0$/, '')
  }, [params, key, defaultDollars, kMode, kDisplayDecimals])

  const [raw, setRaw] = useState(initialRaw)

  // If kMode toggles, rewrite the visible raw string from current dollars in the URL
  useEffect(() => {
    setRaw(initialRaw)
  }, [kMode])

  const dollars = useMemo(() => {
    if (raw.trim() === '') return 0
    if (raw === '.' || raw === '-.' || raw === '-') return 0

    const n = Number(raw)
    if (!Number.isFinite(n)) return 0

    return Math.round(kMode ? n * 1000 : n)
  }, [raw, kMode])

  const commitToUrl = (nextRaw: string) => {
    const nextParams = new URLSearchParams(params)

    if (nextRaw.trim() === '') {
      nextParams.delete(key)
      setParams(nextParams, { replace: true })
      return
    }

    const n = Number(nextRaw)
    if (!Number.isFinite(n)) return

    const nextDollars = Math.round(kMode ? n * 1000 : n)
    if (nextDollars === defaultDollars) {
      nextParams.delete(key)
    } else {
      nextParams.set(key, String(nextDollars))
    }
    setParams(nextParams, { replace: true })
  }

  const onChange = (next: string) => {
    // allow only digits + one dot
    if (!/^\d*\.?\d*$/.test(next)) return

    setRaw(next)
    commitToUrl(next)
  }

  const onBlur = () => {
    // normalize on blur if you want, otherwise do nothing
    if (raw.trim() === '') return

    const n = Number(raw)
    if (!Number.isFinite(n)) return

    if (kMode) {
      setRaw(String(roundTo(n, kDisplayDecimals)).replace(/\.0$/, ''))
    } else {
      setRaw(String(Math.round(n)))
    }
  }

  return { raw, dollars, onChange, onBlur }
}
