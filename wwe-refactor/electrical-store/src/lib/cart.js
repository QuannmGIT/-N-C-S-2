import { useEffect, useState } from 'react'

const KEY = 'vc_cart' // same key/format as the original shop.html

let cart = load()
const listeners = new Set()

// Prices are plain integers (VND). Legacy carts (from the old shop.html
// version of this file) stored priceRaw/priceNew display strings instead —
// normalize them once on load so every caller can rely on a numeric .price.
function toNumber(v) {
  if (v == null || v === '') return 0
  const n = Number(v)
  if (Number.isFinite(n)) return n
  // display strings like "185.000₫" → strip separators → 185000
  return Number(String(v).replace(/[^\d]/g, '')) || 0
}

function normalize(it) {
  if (!it || typeof it !== 'object') return null
  return {
    id: it.id,
    name: it.name,
    img: it.img,
    price: toNumber(it.price ?? it.priceRaw ?? it.priceNew),
    qty: Number(it.qty) || 0,
  }
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(raw) ? raw.map(normalize).filter(Boolean) : []
  } catch {
    return []
  }
}

function commit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cart))
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((fn) => fn(cart))
}

// Products from the catalogue come with a slug (the stable identifier the
// API exposes), so it doubles as the cart line id.
export function addToCart(product) {
  const id = product.slug ?? product.id
  const existing = cart.find((i) => i.id === id)
  if (existing) {
    existing.qty += 1
  } else {
    cart = [...cart, {
      id,
      name: product.name,
      img: product.img,
      price: toNumber(product.price ?? product.priceRaw ?? product.priceNew),
      qty: 1,
    }]
  }
  commit()
}

export function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id)
  if (!item) return
  item.qty += delta
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id)
  commit()
}

export function removeItem(id) {
  cart = cart.filter((i) => i.id !== id)
  commit()
}

export function clearCart() {
  cart = []
  commit()
}

export function useCart() {
  const [items, setItems] = useState(cart)
  useEffect(() => {
    const fn = (c) => setItems([...c])
    listeners.add(fn)
    return () => listeners.delete(fn)
  }, [])
  return items
}
