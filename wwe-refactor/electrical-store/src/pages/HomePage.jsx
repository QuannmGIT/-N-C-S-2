import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Tabs from "../components/Tabs.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Reveal from "../lib/Reveal.jsx";
import { usePageStylesheets } from "../lib/usePageStyles.js";
import { useApi } from "../lib/useApi.js";
import { useToast } from "../lib/toast.jsx";
import { addToCart } from "../lib/cart.js";

const BRANDS = [
  "Arduino Official",
  "Raspberry Pi Foundation",
  "Espressif Systems",
  "Texas Instruments",
  "STMicroelectronics",
  "Adafruit",
];

export default function HomePage() {
  const ready = usePageStylesheets(["/styles/variant/style.css"]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  // Live catalogue: categories with counts + the full product list (the
  // store's whole catalogue fits on one page — same data the old
  // src/data/products.js carried).
  const cats = useApi("/api/categories");
  const products = useApi("/api/products", { limit: 16 });

  // Document title, matching the original <title> of main.html
  useEffect(() => {
    document.title = "VoltCore - Electronic Components";
  }, []);

  // Only after the stylesheet is live, so no unstyled FOUC (same as a fresh
  // load of the original page). (All hooks above and below run before this
  // early return — rules of hooks)
  if (!ready) return null;

  const categoryList = cats.data ?? [];
  const tabList = [
    { key: "all", label: "All" },
    ...categoryList.map((c) => ({ key: c.key, label: c.name })),
  ];

  const items = products.data?.items ?? [];
  const list =
    filter === "all" ? items : items.filter((p) => p.category === filter);
  const total = products.data?.total ?? items.length;

  const goSearch = (value) => {
    const q = value.trim();
    if (q) navigate(`/shop?q=${encodeURIComponent(q)}`);
  };

  const handleAdd = (product, btn) => {
    addToCart(product);
    toast(`Added: ${product.name}`);
    // keep the original pulse animation on the + button
    btn?.classList.remove("pulse");
    void btn?.offsetWidth;
    btn?.classList.add("pulse");
  };

  return (
    <>
      <Navbar
        logo="icon"
        links={[
          { label: "Products", to: "/shop" },
          { label: "Categories", to: "#categories-section" },
          { label: "Projects", to: "/projects" },
          { label: "Blog", to: "/blog" },
          { label: "Contact", to: "#contact-section" },
        ]}
        right={
          <input
            className="search-bar"
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") goSearch(search);
            }}
          />
        }
      />

      <section className="hero">
        <div className="hero-left">
          <div className="hero-badge">
            <span className="badge-dot"></span> National Delivery · Fast 24h
            Shipping
          </div>
          <h1>
            Electronic
            <br />
            <span className="line-accent">Components</span>
            <br />
            <span className="line-orange">Future-Proof</span>
          </h1>
          <p className="hero-desc">
            Providing high-quality semiconductor components, sensors, and IoT
            modules for engineers and tech enthusiasts.
          </p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={() => navigate("/shop")}>
              Shop Now
            </button>
            <button className="btn-outline">
              <Link to="/projects" className="no-underline">
                View Projects
              </Link>
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">15k+</span>
              <span className="stat-label">Products</span>
            </div>
            <div className="stat">
              <span className="stat-num">200+</span>
              <span className="stat-label">Brands</span>
            </div>
            <div className="stat">
              <span className="stat-num">24/7</span>
              <span className="stat-label">Technical Support</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="circuit-board">
            <div className="float-chip">
              <div
                className="chip-icon"
                style={{
                  background: "rgba(0, 229, 255, 0.1)",
                  color: "var(--accent)",
                }}
              >
                <img src="/assets/products/Microcontrollers.png" alt="" />
              </div>
              <span>STM32F405 ARM</span>
            </div>
            <div className="float-chip">
              <div
                className="chip-icon"
                style={{
                  background: "rgba(255, 107, 53, 0.1)",
                  color: "var(--accent2)",
                }}
              >
                <img src="/assets/products/LiPo 3.7V 5000mAh.png" alt="" />
              </div>
              <span>LiPo 3.7V 5000mAh</span>
            </div>
            <div className="float-chip">
              <div
                className="chip-icon"
                style={{
                  background: "rgba(124, 58, 237, 0.1)",
                  color: "var(--accent3)",
                }}
              >
                <img src="/assets/products/LoRa Mesh Module.png" alt="" />
              </div>
              <span>LoRa Mesh Module</span>
            </div>

            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="rgba(0,229,255,0.05)"
                strokeWidth="0.5"
              />
              <path
                d="M100 20 L100 180 M20 100 L180 100"
                stroke="rgba(0,229,255,0.05)"
                strokeWidth="0.5"
              />
              <rect
                x="60"
                y="60"
                width="80"
                height="80"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.5"
                rx="10"
                opacity="0.3"
              />
              <path
                d="M85 85 L115 115 M115 85 L85 115"
                stroke="var(--accent)"
                strokeWidth="2"
                opacity="0.5"
              />
            </svg>
          </div>
        </div>
      </section>

      <div className="marquee-section">
        <div className="marquee-track">
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <div className="marquee-item" key={i}>
              <span className="marquee-dot">●</span>&nbsp;{b}
            </div>
          ))}
        </div>
      </div>

      <Reveal>
        <section id="categories-section" className="categories">
          <span className="section-label">Browse by Category</span>
          <h2 className="section-title">Professional Components</h2>
          <p className="section-sub">
            Carefully selected components, guaranteed genuine with full
            documentation.
          </p>

          <div className="cat-grid">
            {categoryList.map((c) => (
              <div
                className="cat-card"
                key={c.key}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/shop?category=${c.key}`)}
              >
                <div className="cat-icon">
                  <img src={c.img} alt={`${c.name} Icon`} />
                </div>
                <h3 className="cat-name">{c.name}</h3>
                <p className="cat-count">
                  {c.productCount.toLocaleString("vi-VN")} Products
                </p>
                <div className="cat-arrow">→</div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="product-section" className="products">
          <div className="filter-header">
            <div>
              <span className="section-label">Featured Products</span>
              <h2 className="section-title">New Arrivals</h2>
            </div>
            <div className="product-count">
              Showing <span>{list.length}</span> of{" "}
              {total.toLocaleString("vi-VN")} items
            </div>
          </div>

          <Tabs active={filter} onChange={setFilter} categories={tabList} />

          {products.error ? (
            <div
              style={{
                textAlign: "center",
                color: "var(--text-muted)",
                padding: "48px 0",
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
          ) : products.loading && list.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "var(--text-muted)",
                padding: "48px 0",
              }}
            >
              Loading products…
            </div>
          ) : null}

          <div className="products-grid">
            {list.map((p) => (
              <ProductCard
                key={p.slug}
                product={p}
                onAdd={handleAdd}
                onToast={toast}
              />
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="promo-section">
          <div className="promo-grid">
            <div className="promo-card main">
              <span className="promo-tag">Limited Offer</span>
              <h2 className="promo-title">
                Developer Kit
                <br />
                Bundle Pro 2024
              </h2>
              <p className="promo-sub">
                Includes STM32, Logic Analyzer, and over 30 essential sensors
                for your IoT projects.
              </p>
              <button className="btn-primary">Claim 25% Off</button>
              <div className="promo-emoji"></div>
            </div>
            <div className="promo-card side">
              <span className="promo-tag">New Collection</span>
              <h2 className="promo-title" style={{ fontSize: "1.6rem" }}>
                Precision Tools
              </h2>
              <p className="promo-sub">
                Digital microscopes and smart soldering irons.
              </p>
              <button className="btn-outline" style={{ padding: "10px 24px" }}>
                Explore
              </button>
              <div
                className="promo-emoji"
                style={{ fontSize: "4rem", bottom: "20px" }}
              ></div>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="contact-section" className="features">
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">
                <img src="/assets/icons/quality-assurance.svg" alt="" />
              </span>
              <h4 className="feature-title">Quality Assurance</h4>
              <p className="feature-desc">
                All products are tested before shipping to customers.
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">
                <img src="/assets/icons/shipping.svg" alt="" />
              </span>
              <h4 className="feature-title">Lightning Shipping</h4>
              <p className="feature-desc">
                Fast shipping within 2 hours in inner-city areas.
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">
                <img src="/assets/icons/reward-points.svg" alt="" />
              </span>
              <h4 className="feature-title">Reward Points</h4>
              <p className="feature-desc">
                Accumulate points for every order to get direct discounts.
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">
                <img src="/assets/icons/tech-support.svg" alt="" />
              </span>
              <h4 className="feature-title">Tech Support</h4>
              <p className="feature-desc">
                Our team of engineers is ready to assist with your projects.
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      <Footer variant="store" />
    </>
  );
}
