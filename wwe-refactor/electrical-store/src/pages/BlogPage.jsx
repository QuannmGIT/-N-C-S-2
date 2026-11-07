import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Reveal from "../lib/Reveal.jsx";
import { usePageStylesheets } from "../lib/usePageStyles.js";
import { useApi } from "../lib/useApi.js";
import { dateLabel, readsLabel } from "../lib/format.js";

const TOPICS = ["Arduino", "ESP32", "Raspberry Pi", "IoT", "Embedded C++"];
const TOPICS_EXTRA = [
  "MicroPython",
  "PCB Design",
  "Robotics",
  "AI & ML",
  "Power Electronics",
  "Sensors",
];
const AUTHORS = [
  { name: "Yes King", role: "Hardware Engineer", count: "14 posts" },
  { name: "Sigma Boy", role: "Firmware Developer", count: "11 posts" },
  { name: "Hachimi Mambo", role: "IoT Specialist", count: "9 posts" },
];

const avatar = "/assets/icons/userlogo.svg";

// Badge accent per article category — the colours the original cards used.
const CATEGORY_STYLE = {
  Tutorials: { color: "var(--accent)" },
  Reviews: null,
  Technical: { color: "var(--accent2)" },
  "AI & IoT": { color: "var(--accent3)" },
  "Tips & Tricks": { color: "var(--accent2)" },
  Projects: { color: "#f59e0b" },
};

export default function BlogPage() {
  const ready = usePageStylesheets([
    "/styles/variant/blog.css",
    "/styles/blog-page.css",
  ]);
  const [activeCat, setActiveCat] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [topics, setTopics] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Blog – VoltCore Electronics Components";
  }, []);

  // Filtering state is local (as before), server does sorting/paging/search.
  const articles = useApi("/api/articles", {
    category: activeCat !== "All" ? activeCat : undefined,
    q: query || undefined,
    sort,
    page,
    limit: 10,
  });
  // Sidebar "Popular Posts" — newest three by read count.
  const popular = useApi("/api/articles", { sort: "popular", limit: 3 });

  // (all hooks above and below must run before any early return — rules of hooks)
  const q = query.toLowerCase().trim();
  const filtering = activeCat !== "All" || q !== "";

  if (!ready) return null;

  const items = articles.data?.items ?? [];
  const total = articles.data?.total ?? 0;
  const pages = articles.data?.pages ?? 1;

  // Page-1 landing layout mirrors the original blog.html: one hero card,
  // six grid cards, then horizontal rows — all from the current API page.
  const itemsPage = !filtering && page === 1;
  const featured = itemsPage ? (items.find((a) => a.featured) ?? null) : null;
  const rest = featured ? items.filter((a) => a !== featured) : items;
  const grid = itemsPage ? rest.slice(0, 6) : items.slice(0, 6);
  const horizontals = itemsPage ? rest.slice(6) : items.slice(6);

  const goPost = (slug) => navigate(`/blog/${slug}`);

  const changeFilter = (fn) => {
    fn();
    setPage(1);
  };

  const toggleTopic = (t) => {
    setTopics((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  // Card imagery: server items carry img, or an emoji-on-gradient hero for
  // image-less posts.
  const bgStyle = (a) =>
    a.img
      ? {
          backgroundImage: `url('${a.img}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { background: a.gradient ?? "var(--ink)", color: "var(--paper)" };

  return (
    <>
      <Navbar
        logo="mark"
        links={[
          { label: "Home", to: "/" },
          { label: "Products", to: "/shop" },
          { label: "Projects", to: "/projects" },
          { label: "Blog", to: "/blog", active: true },
          { label: "Contact", to: "/#contact-section" },
        ]}
        right={
          <Link to="/shop" className="nav-cta">
            Shop Now →
          </Link>
        }
      />

      <header className="blog-hero">
        <div className="hero-label">Knowledge & Tutorials</div>
        <h1>
          Learn <em>Engineering</em>
          <br />
          from the Field
        </h1>
        <p>
          In-depth articles on electronics, embedded programming, IoT, and maker
          culture — written by engineers, for those who truly want to build.
        </p>
        <div className="hero-stats-row">
          <div>
            <div className="hero-stat-num">86</div>
            <div className="hero-stat-label">Articles</div>
          </div>
          <div>
            <div className="hero-stat-num">12</div>
            <div className="hero-stat-label">Authors</div>
          </div>
          <div>
            <div className="hero-stat-num">140K</div>
            <div className="hero-stat-label">Reads / Month</div>
          </div>
          <div>
            <div className="hero-stat-num">4.9★</div>
            <div className="hero-stat-label">Rating</div>
          </div>
        </div>
      </header>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="filter-cats">
          {[
            "All",
            "Tutorials",
            "Reviews",
            "Technical",
            "Tips & Tricks",
            "AI & IoT",
            "Projects",
          ].map((c) => (
            <button
              key={c}
              className={`filter-pill${activeCat === c ? " active" : ""}`}
              data-cat={c}
              onClick={() => changeFilter(() => setActiveCat(c))}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="search-wrap">
          <span className="icon">
            <img src="/assets/icons/search.svg" alt="" />
          </span>
          <input
            type="text"
            placeholder="Search articles…"
            autoComplete="off"
            value={query}
            onChange={(e) => changeFilter(() => setQuery(e.target.value))}
          />
        </div>
      </div>

      {/* MAIN */}
      <div className="blog-main">
        <div className="content-area">
          {articles.error ? (
            <div className="no-results show">
              {articles.error}{" "}
              <button
                className="filter-pill"
                style={{ marginLeft: 8 }}
                onClick={articles.retry}
              >
                Retry
              </button>
            </div>
          ) : !articles.data && articles.loading ? (
            <Reveal threshold={0.06}>
              <div className="result-count">Loading articles…</div>
            </Reveal>
          ) : null}

          {/* Featured */}
          {featured ? (
            <Reveal threshold={0.06} className="featured-section">
              <div
                className="featured-post"
                data-cat={featured.category}
                onClick={() => goPost(featured.slug)}
              >
                <div
                  className="featured-img"
                  style={{
                    ...bgStyle(featured),
                    backgroundColor: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {!featured.img ? (
                    <span style={{ fontSize: "4rem" }}>{featured.emoji}</span>
                  ) : null}
                  <div className="featured-tag">{featured.catLabel}</div>
                </div>
                <div className="featured-body">
                  <div className="featured-meta">
                    <span>
                      <img
                        className="icon-img"
                        src={featured.avatar ?? avatar}
                        alt=""
                      />{" "}
                      {featured.author}
                    </span>
                    <span>·</span>
                    <span>
                      <img
                        className="icon-img"
                        src="/assets/icons/dates.svg"
                        alt=""
                      />{" "}
                      {dateLabel(featured.published)}
                    </span>
                    <span>·</span>
                    <span>⏱ {featured.minutes} min read</span>
                  </div>
                  <h2>{featured.title}</h2>
                  <p>{featured.excerpt}</p>
                  <span className="read-btn">Read Article →</span>
                </div>
              </div>
            </Reveal>
          ) : null}

          {/* Latest Posts */}
          <Reveal threshold={0.06}>
            <div className="sort-row">
              <div className="sec-label" style={{ marginBottom: 0 }}>
                Latest Posts
              </div>
              <select
                className="sort-select"
                value={sort}
                onChange={(e) => changeFilter(() => setSort(e.target.value))}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="shortest">Shortest Read</option>
              </select>
            </div>
          </Reveal>

          <Reveal threshold={0.06}>
            <span className="result-count">
              {filtering
                ? `Showing ${total} article${total !== 1 ? "s" : ""}`
                : ""}
            </span>
          </Reveal>

          <Reveal threshold={0.06}>
            <div className="posts-grid">
              {grid.map((p) => (
                <div
                  className="post-card"
                  key={p.slug}
                  onClick={() => goPost(p.slug)}
                >
                  <div
                    className="post-thumb"
                    style={{
                      ...bgStyle(p),
                      display: p.img ? undefined : "flex",
                      alignItems: p.img ? undefined : "center",
                      justifyContent: p.img ? undefined : "center",
                    }}
                  >
                    {!p.img ? (
                      <span style={{ fontSize: "2.5rem" }}>{p.emoji}</span>
                    ) : null}
                    <span
                      className="post-cat"
                      style={CATEGORY_STYLE[p.category] ?? undefined}
                    >
                      {p.catLabel}
                    </span>
                  </div>
                  <div className="post-body">
                    <div className="post-meta">
                      <span>{dateLabel(p.published)}</span>
                      <span>·</span>
                      <span>{p.minutes} min read</span>
                    </div>
                    <h3>{p.title}</h3>
                    <p>{p.excerpt}</p>
                    <div className="post-footer">
                      <div className="author-chip">
                        <div className="avatar">
                          <img className="icon-img" src={avatar} alt="" />
                        </div>
                        {p.author}
                      </div>
                      <span className="post-link">Read →</span>
                    </div>
                  </div>
                </div>
              ))}
              {grid.length === 0 && !articles.loading && !articles.error ? (
                <div className="no-results show">
                  No articles found. Try a different filter or search term.
                </div>
              ) : null}
            </div>
          </Reveal>

          {/* More Articles */}
          {itemsPage && horizontals.length > 0 ? (
            <Reveal threshold={0.06}>
              <div className="sec-label">More Articles</div>
            </Reveal>
          ) : null}

          {horizontals.map((h) => (
            <Reveal key={h.slug} threshold={0.06}>
              <div className="post-horizontal" onClick={() => goPost(h.slug)}>
                <div
                  className="post-h-thumb"
                  style={{
                    ...bgStyle(h),
                    display: h.img ? undefined : "flex",
                    alignItems: h.img ? undefined : "center",
                    justifyContent: h.img ? undefined : "center",
                    color: "var(--paper)",
                    fontSize: "2rem",
                  }}
                >
                  {!h.img ? h.emoji : null}
                </div>
                <div>
                  <div
                    className="post-h-cat"
                    style={CATEGORY_STYLE[h.category] ?? undefined}
                  >
                    {h.catLabel}
                  </div>
                  <h3>{h.title}</h3>
                  <div className="post-meta">
                    <span>
                      <img
                        className="icon-img"
                        src={h.avatar ?? avatar}
                        alt=""
                      />{" "}
                      {h.author}
                    </span>
                    <span>·</span>
                    <span>{dateLabel(h.published)}</span>
                    <span>·</span>
                    <span>{h.minutes} min read</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}

          <Reveal threshold={0.06}>
            <div className="pagination">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`page-btn${page === n ? " active" : ""}`}
                  onClick={() => {
                    setPage(n);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {n}
                </button>
              ))}
              {pages > 2 && page < pages ? (
                <button
                  className="page-btn"
                  onClick={() => {
                    setPage(page + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  →
                </button>
              ) : null}
            </div>
          </Reveal>
        </div>

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-card nl-card">
            <div className="sidebar-head">
              <img src="/assets/icons/Newsletter.svg" alt="" /> Newsletter
            </div>
            <p>
              New articles and exclusive deals every week. Joined by 8,400+
              makers.
            </p>
            <input
              className="nl-input"
              type="email"
              placeholder="your@email.com"
            />
            <button className="nl-btn">Subscribe Free ✦</button>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-head">
              <img src="/assets/icons/topics.svg" alt="" /> Topics
            </div>
            <div className="topics-wrap">
              {TOPICS.map((t) => (
                <span
                  key={t}
                  className={`topic${topics.has(t) ? " active" : ""}`}
                  data-topic={t}
                  onClick={() => toggleTopic(t)}
                >
                  {t}
                </span>
              ))}
              {TOPICS_EXTRA.map((t) => (
                <span
                  key={t}
                  className={`topic extra${expanded ? " visible" : ""}${topics.has(t) ? " active" : ""}`}
                  data-topic={t}
                  onClick={() => toggleTopic(t)}
                >
                  {t}
                </span>
              ))}
            </div>
            <button
              className="show-more-topics"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "− Show less" : "+ Show more topics"}
            </button>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-head">
              <img src="/assets/icons/popular.svg" alt="" /> Popular Posts
            </div>
            {(popular.data?.items ?? []).map((p, i) => (
              <div
                className="popular-item"
                key={p.slug}
                onClick={() => goPost(p.slug)}
              >
                <div className="pop-num">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <div className="pop-title">{p.title}</div>
                  <div className="pop-meta">{readsLabel(p.reads)} reads</div>
                </div>
              </div>
            ))}
          </div>

          <div className="sidebar-card">
            <div className="sidebar-head">
              <img src="/assets/icons/author.svg" alt="" /> Authors
            </div>
            {AUTHORS.map((a) => (
              <div className="author-row" key={a.name}>
                <div className="author-ava">
                  <img className="icon-img" src={avatar} alt="" />
                </div>
                <div>
                  <div className="author-name">{a.name}</div>
                  <div className="author-role">{a.role}</div>
                </div>
                <div className="author-count">{a.count}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <Footer variant="paper" contactLine="Da Nang · hakidabest@gmail.com" />
    </>
  );
}
