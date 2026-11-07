import { useState } from 'react'
import favor from "/assets/icons/fav.svg"
import { vnd } from '../lib/format.js'

/**
 * Product card — the same markup the static pages generated from their
 * duplicated template literals (main.html renderProducts / shop.html grid),
 * now one component. Products come from GET /api/products with numeric
 * `price` / `oldPrice` (VND integers), formatted here.
 */
export default function ProductCard({ product, onAdd, onToast }) {
  const [wished, setWished] = useState(false)

  const toggleWish = () => {
    const next = !wished
    setWished(next)
    onToast?.(next ? 'Added to wishlist!' : 'Removed from wishlist!')
  }

  return (
    <div className="product-card">
      <div className="product-img">
        <img src={product.img} alt={product.name} className="main-img" />
        {product.badge ? (
          <span className={`product-badge ${product.badge}`}>{product.badge.toUpperCase()}</span>
        ) : null}
        <div className={`wishlist-btn${wished ? ' active' : ''}`} onClick={toggleWish}>
          <img src={favor} alt="Add to wishlist" />
        </div>
      </div>
      <div className="product-info">
        <span className="product-brand">{product.brand}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-specs">{product.specs}</p>
        <div className="product-bottom">
          <div className="product-price">
            <span className="price-new">{vnd(product.price)}</span>
            {product.oldPrice ? <span className="price-old">{vnd(product.oldPrice)}</span> : null}
          </div>
          <button className="add-btn" onClick={(e) => onAdd(product, e.currentTarget)}>+</button>
        </div>
      </div>
    </div>
  )
}
