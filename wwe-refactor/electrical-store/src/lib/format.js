/**
 * Display formatters. Prices live as integers (VND) in the API/database; the
 * server never owns locale formatting, so every display string is produced
 * here in one place (previously duplicated as priceNew/priceOld strings).
 */

export function vnd(n) {
  return `${Number(n ?? 0).toLocaleString('vi-VN')}₫`
}

// "2025-03-28" -> "March 28, 2025" (the card/article format)
export function dateLabel(iso) {
  if (!iso) return '–'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// 34200 -> "34.2K", 9800 -> "9.8K", 7600 -> "7.6K" (reads counters)
export function readsLabel(n) {
  const v = Number(n ?? 0)
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return String(v)
}
