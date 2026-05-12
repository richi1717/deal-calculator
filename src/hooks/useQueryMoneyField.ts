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
    const nextParams = new URLSearchParams(params)
    const cleaned = stripCommas(cleanedRaw).trim()

    if (cleaned === '') {
      nextParams.delete(key)
      setParams(nextParams, { replace: true })
      return
    }

    const n = Number(cleaned)
    if (!Number.isFinite(n)) return

    const nextDollars = Math.round(kMode ? n * 1000 : n)

    if (nextDollars === defaultDollars) nextParams.delete(key)
    else nextParams.set(key, String(nextDollars))

    setParams(nextParams, { replace: true })
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
    const nextParams = new URLSearchParams(params)
    if (rounded === defaultDollars) nextParams.delete(key)
    else nextParams.set(key, String(rounded))
    setParams(nextParams, { replace: true })

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
