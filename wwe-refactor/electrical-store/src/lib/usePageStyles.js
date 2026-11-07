import { useEffect, useState } from 'react'

/**
 * Loads one stylesheet set per page — the exact equivalent of how the
 * original static pages each loaded their own CSS file(s) in <head>.
 * The <link> tags are added on mount and removed on unmount, so only the
 * active page's styles are live at any time (same reload behaviour as the
 * multi-page site, no cross-page CSS conflicts).
 *
 * Readiness is derived: the hook remembers the key of the set that finished
 * loading, and is ready while that key matches the page's own — so switching
 * pages un-readies instantly without any synchronous setState in the effect.
 */
export function usePageStylesheets(hrefs) {
  const key = hrefs.join('|')
  const [loadedKey, setLoadedKey] = useState(null)

  useEffect(() => {
    // The effect only re-runs when `key` changes; the original href list is
    // content-identical to the one that produced this key, so split() it
    // back (hrefs contain no '|').
    const list = key.split('|')
    let alive = true
    let pending = list.length

    const done = () => {
      if (alive && pending === 0) {
        // one frame so the browser can apply the new cascade before paint
        requestAnimationFrame(() =>
          requestAnimationFrame(() => alive && setLoadedKey(key)),
        )
      }
    }

    const links = list.map((href) => {
      const l = document.createElement('link')
      l.rel = 'stylesheet'
      l.href = href
      l.onload = () => {
        pending -= 1
        done()
      }
      l.onerror = () => {
        // Load failures must never be silent — a wrong href means a page
        // renders unstyled with nothing visible in the console otherwise.
        console.warn(`[usePageStyles] stylesheet failed to load: ${l.href}`)
        pending -= 1
        done()
      }
      document.head.appendChild(l)
      return l
    })

    return () => {
      alive = false
      links.forEach((l) => l.remove())
    }
  }, [key])

  return loadedKey === key
}
