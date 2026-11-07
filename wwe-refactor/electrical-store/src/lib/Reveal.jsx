import { useEffect, useRef } from 'react'

/**
 * Scroll-reveal wrapper — same behaviour as the original pages'
 * IntersectionObserver on `.reveal` elements.
 * threshold: original main.html used 0.15, blog.html used 0.06.
 */
export default function Reveal({ children, threshold = 0.15, once = true, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add('visible')
            if (once) observer.unobserve(el)
          }
        })
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once])

  return (
    <div ref={ref} className={`reveal${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  )
}
