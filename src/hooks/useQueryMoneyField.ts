import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const roundTo = (n: number, decimals: number) => {
  const p = 10 ** decimals
  return Math.round((n + Number.EPSILON) * p) / p
}

const stripCommas = (value: string) => value.replace(/,/g, '')

const formatNumber = (n: number, decimals: number) => {
  if (!Number.isFinite(n)) return ''
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

type Options = {
  kMode: boolean
  defaultDollars: number
  hardCodedDefault?: number
  key: string
  kDisplayDecimals?: number
}

export function useQueryMoneyField({
  key,
  defaultDollars,
  hardCodedDefault,
  kMode,
  kDisplayDecimals = 1,
}: Options) {
  const [params, setParams] = useSearchParams()

  const initialRaw = useMemo(() => {
    const rawParam = params.get(key)
    const n = rawParam !== null ? Number(rawParam) : NaN
    const dollars = Number.isFinite(n) ? n : defaultDollars

    if (!kMode) return formatNumber(dollars, 0)

    const k = dollars / 1000
    const rounded = roundTo(k, kDisplayDecimals)
    return formatNumber(rounded, kDisplayDecimals).replace(/\.0$/, '')
  }, [params, key, defaultDollars, kMode, kDisplayDecimals])

  const [raw, setRaw] = useState(initialRaw)

  useEffect(() => {
    setRaw(initialRaw)
  }, [initialRaw])

  const dollars = useMemo(() => {
    const cleaned = stripCommas(raw).trim()
    if (cleaned === '') return 0
    if (cleaned === '.' || cleaned === '-.' || cleaned === '-') return 0

    const n = Number(cleaned)
    if (!Number.isFinite(n)) return 0

    return Math.round(kMode ? n * 1000 : n)
  }, [raw, kMode])

  const commitToUrl = (cleanedRaw: string) => {
    const cleaned = stripCommas(cleanedRaw).trim()
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (cleaned === '') {
          next.delete(key)
          return next
        }
        const n = Number(cleaned)
        if (!Number.isFinite(n)) return prev
        const nextDollars = Math.round(kMode ? n * 1000 : n)
        const baseline = hardCodedDefault ?? 0
        if (nextDollars === 0 || nextDollars === baseline) next.delete(key)
        else next.set(key, String(nextDollars))
        return next
      },
      { replace: true },
    )
  }

  const onChange = (next: string) => {
    const cleaned = stripCommas(next)
    if (!/^\d*\.?\d*$/.test(cleaned)) return
    setRaw(cleaned)
  }

  const onFocus = () => {
    setRaw(stripCommas(raw))
  }

  const onBlur = () => {
    const cleaned = stripCommas(raw).trim()
    commitToUrl(cleaned)

    if (cleaned === '') return

    const n = Number(cleaned)
    if (!Number.isFinite(n)) return

    if (kMode) {
      const rounded = roundTo(n, kDisplayDecimals)
      setRaw(formatNumber(rounded, kDisplayDecimals).replace(/\.0$/, ''))
    } else {
      const rounded = Math.round(n)
      setRaw(formatNumber(rounded, 0))
    }
  }

  const setValue = (nextDollars: number) => {
    const rounded = Math.round(nextDollars)
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        const baseline = hardCodedDefault ?? 0
        if (rounded === 0 || rounded === baseline) next.delete(key)
        else next.set(key, String(rounded))
        return next
      },
      { replace: true },
    )


    if (kMode) {
      const k = rounded / 1000
      setRaw(
        formatNumber(roundTo(k, kDisplayDecimals), kDisplayDecimals).replace(
          /\.0$/,
          '',
        ),
      )
    } else {
      setRaw(formatNumber(rounded, 0))
    }
  }

  return { raw, dollars, onChange, onFocus, onBlur, setValue }
}
