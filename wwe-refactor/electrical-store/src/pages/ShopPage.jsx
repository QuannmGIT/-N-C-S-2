import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Tabs from "../components/Tabs.jsx";
import ProductCard from "../components/ProductCard.jsx";
import CartDrawer from "../components/CartDrawer.jsx";
import { usePageStylesheets } from "../lib/usePageStyles.js";
import { useApi } from "../lib/useApi.js";
import { useToast } from "../lib/toast.jsx";
import { useCart, addToCart } from "../lib/cart.js";

// Shop state lives in the URL (?category=&q=&sort=&page=) so filters survive
// reloads and can be entered directly (Home's search bar jumps to
// /shop?q=...). Only non-default values are written to the URL.
const SORTS = ["default", "price-asc", "price-desc", "name"];

function paramsToUrl({ category, q, sort, page }) {
  const sp = new URLSearchParams();
  if (category && category !== "all") sp.set("category", category);
  if (q) sp.set("q", q);
  if (sort && sort !== "default") sp.set("sort", sort);
  if (page && page > 1) sp.set("page", String(page));
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export default function ShopPage() {
  const ready = usePageStylesheets([
    "/styles/variant/style.css",
    "/styles/shop-page.css",
  ]);
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") ?? "all";
  const q = searchParams.get("q") ?? "";
  const sort = SORTS.includes(searchParams.get("sort"))
    ? searchParams.get("sort")
    : "default";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [query, setQuery] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useCart();
  const toast = useToast();

  const products = useApi("/api/products", {
    category: category !== "all" ? category : undefined,
    q: q || undefined,
    sort,
    page,
    limit: 12,
  });
  const cats = useApi("/api/categories");

  useEffect(() => {
    document.title = "VoltCore – Shop";
  }, []);

  // Keep the search input in sync when the URL changes (navigation,
  // back/forward) — render-phase adjustment, no effect needed.
  if (q !== prevQ) {
    setPrevQ(q);
    setQuery(q);
  }

  const navigateTo = (next, opts = {}) => {
    setSearchParams(paramsToUrl(next), opts);
  };

  // (all hooks run before this early return — rules of hooks)
  if (!ready) return null;

  const tabList = [
    { key: "all", label: "All" },
    ...(cats.data ?? []).map((c) => ({ key: c.key, label: c.name })),
  ];

  const items = products.data?.items ?? [];
  const total = products.data?.total ?? 0;
  const pages = products.data?.pages ?? 1;

  const handleAdd = (product, btn) => {
    addToCart(product);
    toast(`Added: ${product.name}`);
    // original pulse animation
    btn.classList.remove("pulse");
    void btn.offsetWidth;
    btn.classList.add("pulse");
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const goPage = (n) => {
    if (n < 1 || n > pages || n === page) return;
    navigateTo({ category, q, sort, page: n });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Navbar
        logo="icon"
        logoHref="/"
        links={[
          { label: "Home", to: "/" },
          { label: "Shop", to: "/shop", active: true },
          { label: "Projects", to: "/projects" },
          { label: "Blog", to: "/blog" },
        ]}
        right={
          <button className="cart-btn" onClick={() => setCartOpen(true)}>
            <img src="/assets/icons/cart.svg" alt="" className="cart-icon" />{" "}
            Cart <span className="cart-badge">{cartCount}</span>
          </button>
        }
      />

      {/* SHOP HERO */}
      <div className="shop-hero">
        <span className="section-label">VoltCore Store</span>
        <h1>
          All <span>Products</span>
        </h1>
        <p>
          Browse our full catalogue of electronic components, modules, and
          tools.
        </p>
      </div>

      {/* MAIN SHOP BODY */}
      <div className="shop-body">
        <Tabs
          active={category}
          categories={tabList}
          onChange={(key) =>
            navigateTo({ category: key, q, sort: "default", page: 1 })
          }
        />

        {/* TOOLBAR */}
        <div className="shop-toolbar">
          <input
            className="shop-search"
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // replace:true — typing shouldn't push a history entry per key
              navigateTo(
                { category, q: e.target.value, sort: "default", page: 1 },
                { replace: true },
              );
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <select
              className="sort-select"
              value={sort}
              onChange={(e) =>
                navigateTo({ category, q, sort: e.target.value, page: 1 })
              }
            >
              <option value="default">Sort: Featured</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="name">Name A–Z</option>
            </select>
            <div className="shop-count">
              Showing <span>{total}</span> products
            </div>
          </div>
        </div>

        {products.error ? (
          <div
            style={{
              gridColumn: "1/-1",
              textAlign: "center",
              color: "var(--text-muted)",
              padding: "60px 0",
            }}
          >
            {products.error}{" "}
            <button
              className="btn-outline"
              style={{ padding: "8px 20px" }}
              onClick={products.retry}
            >
              Retry
            </button>
          </div>
        ) : (
          /* GRID */
          <div className="shop-products-grid">
            {items.length ? (
              items.map((p) => (
                <ProductCard
                  key={p.slug}
                  product={p}
                  onAdd={handleAdd}
                  onToast={toast}
                />
              ))
            ) : products.loading ? (
              <div
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  padding: "60px 0",
                  fontSize: "0.95rem",
                }}
              >
                Loading products…
              </div>
            ) : (
              <div
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  padding: "60px 0",
                  fontSize: "0.95rem",
                }}
              >
                No products found for "<strong>{q}</strong>"
              </div>
            )}
          </div>
        )}

        {/* PAGINATION */}
        {pages > 1 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              padding: "28px 0 8px",
            }}
          >
            <button
              onClick={() => goPage(page - 1)}
              disabled={page <= 1}
              style={{
                padding: "9px 16px",
                borderRadius: 10,
                border: "1px solid var(--border, #e5e5e5)",
                background: "transparent",
                cursor: page <= 1 ? "not-allowed" : "pointer",
                opacity: page <= 1 ? 0.4 : 1,
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "0.85rem",
              }}
            >
              ← Prev
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => goPage(n)}
                style={{
                  width: 38,
                  padding: "9px 0",
                  borderRadius: 10,
                  border: "1px solid var(--border, #e5e5e5)",
                  background:
                    n === page ? "var(--accent, #ff6b35)" : "transparent",
                  color: n === page ? "#fff" : "inherit",
                  cursor: "pointer",
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: "0.85rem",
                }}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => goPage(page + 1)}
              disabled={page >= pages}
              style={{
                padding: "9px 16px",
                borderRadius: 10,
                border: "1px solid var(--border, #e5e5e5)",
                background: "transparent",
                cursor: page >= pages ? "not-allowed" : "pointer",
                opacity: page >= pages ? 0.4 : 1,
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "0.85rem",
              }}
            >
              Next →
            </button>
          </div>
        ) : null}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
