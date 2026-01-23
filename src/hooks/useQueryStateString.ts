import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export function useQueryStateString(key: string, defaultValue = '') {
  const [params, setParams] = useSearchParams()

  const initial = useMemo(() => {
    const raw = params.get(key)
    if (raw === null) return defaultValue

    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }, [params, key, defaultValue])

  const [raw, setRaw] = useState(initial)

  // If URL changes externally, sync back to input
  useEffect(() => {
    setRaw(initial)
  }, [initial])

  const commitToUrl = (next: string) => {
    const nextParams = new URLSearchParams(params)

    if (next.trim() === '') {
      nextParams.delete(key)
    } else {
      nextParams.set(key, encodeURIComponent(next))
    }

    setParams(nextParams, { replace: true })
  }

  const onChange = (next: string) => {
    setRaw(next) // allow spaces freely
    commitToUrl(next) // encode only here
  }

  const onBlur = () => {
    // optional normalization point
    if (raw !== raw.trim()) {
      setRaw(raw.trim())
      commitToUrl(raw.trim())
    }
  }

  return { raw, onChange, onBlur }
}
