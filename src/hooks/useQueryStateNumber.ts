import { useSearchParams } from 'react-router-dom'
import { useCallback, useMemo } from 'react'

export function useQueryStateNumber(
  key: string,
  defaultValue: number,
): [number, (v: number) => void] {
  const [params, setParams] = useSearchParams()

  const value = useMemo(() => {
    const raw = params.get(key)
    const n = raw !== null ? Number(raw) : NaN
    return Number.isFinite(n) ? n : defaultValue
  }, [params, key, defaultValue])

  const setValue = useCallback(
    (next: number) => {
      const nextParams = new URLSearchParams(params)
      if (next === defaultValue) {
        nextParams.delete(key)
      } else {
        nextParams.set(key, String(next))
      }
      setParams(nextParams, { replace: true })
    },
    [params, setParams, key, defaultValue],
  )

  return [value, setValue]
}
