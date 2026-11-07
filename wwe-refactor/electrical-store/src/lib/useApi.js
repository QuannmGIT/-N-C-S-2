import { useEffect, useState } from 'react'
import { apiGet } from './api.js'

/**
 * useApi — small fetch hook for the catalogue endpoints.
 *
 * - loading/error state, `retry()` after a failure
 * - automatic refetch when `params` change (compared by JSON key)
 * - last successful data stays visible while a new request loads, so grids
 *   don't blank out between filter changes
 * - in-flight requests are aborted on unmount / param change
 * - `loading` is derived from the key of the last completed request, so the
 *   effect body never calls setState synchronously
 */
export function useApi(path, params) {
  const [state, setState] = useState({ data: null, error: null, doneKey: null })
  const [tick, setTick] = useState(0)
  const key = JSON.stringify(params ?? null)
  const loading = state.doneKey !== key

  useEffect(() => {
    const ctrl = new AbortController()
    apiGet(path, JSON.parse(key), ctrl.signal)
      .then((res) => {
        if (ctrl.signal.aborted) return
        if (res.ok) {
          setState({ data: res.data, error: null, doneKey: key })
        } else {
          setState((s) => ({
            data: s.data,
            error: res.data.error || 'Yêu cầu thất bại',
            doneKey: key,
          }))
        }
      })
      .catch(() => {
        if (ctrl.signal.aborted) return
        setState((s) => ({
          data: s.data,
          error: 'Không thể kết nối server',
          doneKey: key,
        }))
      })
    return () => ctrl.abort()
  }, [path, key, tick])

  const retry = () => setTick((t) => t + 1)
  return { data: state.data, error: state.error, loading, retry }
}
