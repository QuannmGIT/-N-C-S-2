import { useCart, changeQty, removeItem, clearCart } from "../lib/cart.js";
import { vnd } from "../lib/format.js";
import { useToast } from "../lib/toast.jsx";
import carts from "/assets/icons/cart.svg"
/**
 * Cart drawer — port of shop.html's .cart-overlay / .cart-drawer block and its
 * renderCartDrawer / changeQty / removeItem / clearCart script logic.
 */
export default function CartDrawer({ open, onClose }) {
  const cart = useCart();
  const toast = useToast();

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <>
      <div className={`cart-overlay${open ? " open" : ""}`} onClick={onClose} />
      <div className={`cart-drawer${open ? " open" : ""}`}>
        <div className="cart-header">
          <h2>
            <img
              src={carts}
              alt=""
              className="cart-icon cart-icon-light"
            />{" "}
            Your Cart
          </h2>
          <button className="cart-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <img src={carts} alt="" />
              </div>
              <div>Your cart is empty</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Add some products to get started
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-img">
                  <img src={item.img} alt={item.name} />
                </div>
                <div>
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{vnd(item.price)}</div>
                </div>
                <div className="cart-item-controls">
                  <button
                    className="qty-btn"
                    onClick={() => changeQty(item.id, 1)}
                  >
                    +
                  </button>
                  <span className="qty-val">{item.qty}</span>
                  <button
                    className="qty-btn"
                    onClick={() => changeQty(item.id, -1)}
                  >
                    −
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => removeItem(item.id)}
                  >
                    ✕ remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div
          className="cart-footer"
          style={{ display: cart.length ? "block" : "none" }}
        >
          <div className="cart-subtotal">
            <span>Subtotal</span>
            <span>{vnd(subtotal)}</span>
          </div>
          <button
            className="checkout-btn"
            onClick={() => toast("🎉 Checkout coming soon!")}
          >
            Proceed to Checkout
          </button>
          <button className="clear-btn" onClick={() => clearCart()}>
            Remove all items
          </button>
        </div>
      </div>
    </>
  );
}
