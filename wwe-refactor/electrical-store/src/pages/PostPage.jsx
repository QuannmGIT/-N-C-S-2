import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { usePageStylesheets } from "../lib/usePageStyles.js";
import { useApi } from "../lib/useApi.js";
import { dateLabel, readsLabel } from "../lib/format.js";

const avatar = "/assets/icons/userlogo.svg";

// Shown when the API returns 404 (unknown slug) or the fetch fails — the
// honest version of the old POSTS.__default__ fallback.
const NOT_FOUND = {
  title: "Article Not Found",
  category: "Blog",
  catColor: null,
  author: "VoltCore Team",
  avatar,
  published: null,
  minutes: 0,
  reads: 0,
  img: null,
  emoji: "🛸",
  gradient: "linear-gradient(135deg,#08121f,#14283f)",
  tags: [],
  toc: [],
  content:
    '<p>The article you are looking for does not exist or has been moved. Check the <a href="/blog">blog index</a> for the latest guides.</p>',
};

/**
 * Related Posts sidebar — fetches the most popular articles in the same
 * category, excluding the current one. Its own useApi call must live inside
 * a component so hooks stay valid while the parent re-renders per slug.
 */
function RelatedPosts({ category, exclude }) {
  const navigate = useNavigate();
  const related = useApi("/api/articles", {
    category: category || undefined,
    sort: "popular",
    limit: 4,
  });
  const list = (related.data?.items ?? [])
    .filter((a) => a.slug !== exclude)
    .slice(0, 3);
  if (list.length === 0) {
    return related.loading ? null : (
      <p style={{ fontSize: "0.8rem", color: "var(--ink3)" }}>
        No related posts yet.
      </p>
    );
  }
  return list.map((rp) => (
    <div
      className="related-item"
      key={rp.slug}
      onClick={() => navigate(`/blog/${rp.slug}`)}
    >
      <div
        className="rel-thumb"
        style={{
          background: rp.gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
        }}
      >
        {rp.emoji}
      </div>
      <div>
        <h4>{rp.title}</h4>
        <span>
          {rp.minutes} min read · {rp.category}
        </span>
      </div>
    </div>
  ));
}

export default function PostPage() {
  const ready = usePageStylesheets(["/styles/post-page.css"]);
  const { slug } = useParams();
  const article = useApi(`/api/articles/${slug}`);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // (all hooks run before this early return — rules of hooks)
  useEffect(() => {
    const title = article.data?.title;
    if (title) document.title = title + " – VoltCore Blog";
  }, [article.data?.title]);

  // reading progress bar (ported from post.html's scroll listener)
  useEffect(() => {
    const onScroll = () => {
      const art = document.getElementById("articleArea");
      if (!art) return;
      const total = art.offsetHeight;
      const read = Math.max(0, -art.getBoundingClientRect().top);
      setProgress(Math.min(100, (read / total) * 100));
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug]);

  if (!ready) return null;

  const post = article.data ?? (article.error ? NOT_FOUND : null);
  const loading = !post && article.loading;

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <>
      <div className="progress-bar" style={{ width: progress + "%" }} />

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

      {loading ? (
        <div
          style={{
            maxWidth: 840,
            margin: "60px auto",
            fontFamily: "'JetBrains Mono',monospace",
            color: "var(--ink3)",
          }}
        >
          Loading article…
        </div>
      ) : (
        <>
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <Link to="/blog">Blog</Link>
            <span>›</span>
            <span>{post.category}</span>
          </div>

          <div className="page-wrap">
            {/* ARTICLE */}
            <article id="articleArea">
              <Link to="/blog" className="back-btn">
                ← Back to Blog
              </Link>

              <div
                className="post-tag"
                style={{ color: post.catColor ?? undefined }}
              >
                {post.catLabel ?? post.category}
              </div>

              <h1>{post.title}</h1>

              <div className="post-meta-row">
                <div className="meta-author">
                  <div className="meta-avatar">
                    <img src={post.avatar ?? avatar} alt="" />
                  </div>
                  <span>{post.author}</span>
                </div>
                <span>{dateLabel(post.published)}</span>
                <span>·</span>
                <span>{post.minutes} min read</span>
                <span>·</span>
                <span>{readsLabel(post.reads)} reads</span>
              </div>

              <div
                className="post-hero-img"
                style={
                  post.img
                    ? {
                        backgroundImage: `url('${post.img}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {
                        background: post.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "6rem",
                      }
                }
              >
                {post.img ? null : post.emoji}
              </div>

              <div
                className="post-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <div className="post-tags">
                {post.tags.map((t) => (
                  <span
                    className="post-tag-chip"
                    key={t}
                    onClick={() => navigate("/blog")}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="share-row">
                <span className="share-label">Share</span>
                <a className="share-btn" title="Copy link" onClick={copyLink}>
                  {copied ? "✅" : "🔗"}
                </a>
                <a
                  className="share-btn"
                  title="Twitter/X"
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                >
                  𝕏
                </a>
                <a
                  className="share-btn"
                  title="Facebook"
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                >
                  f
                </a>
              </div>
            </article>

            {/* SIDEBAR */}
            <aside className="sidebar">
              <div className="sidebar-card">
                <div className="sidebar-head">📋 Contents</div>
                <ul className="toc-list">
                  {post.toc.length === 0 ? (
                    <li>
                      <span
                        style={{ color: "var(--ink3)", fontSize: "0.8rem" }}
                      >
                        No sections
                      </span>
                    </li>
                  ) : (
                    post.toc.map((item, i) => (
                      <li key={i}>
                        <a href={`#s${i}`}>
                          <span className="toc-num">0{i + 1}</span>
                          {item}
                        </a>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className="sidebar-card">
                <div className="sidebar-head">📖 Related Posts</div>
                <RelatedPosts category={post.category} exclude={slug} />
              </div>

              <div
                className="sidebar-card"
                style={{ background: "var(--ink)", borderColor: "var(--ink)" }}
              >
                <div className="sidebar-head" style={{ color: "#fff" }}>
                  <img src="/assets/icons/Newsletter.svg" alt="" /> Newsletter
                </div>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,.6)",
                    lineHeight: 1.65,
                    marginBottom: 16,
                  }}
                >
                  Get new articles in your inbox every week.
                </p>
                <input
                  type="email"
                  placeholder="your@email.com"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,.08)",
                    border: "1px solid rgba(255,255,255,.15)",
                    borderRadius: 10,
                    padding: "9px 12px",
                    color: "#fff",
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: "0.82rem",
                    outline: "none",
                    marginBottom: 10,
                  }}
                />
                <button
                  style={{
                    width: "100%",
                    background: "var(--accent)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: 10,
                    fontFamily: "'JetBrains Mono',monospace",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  Subscribe ✦
                </button>
              </div>
            </aside>
          </div>
        </>
      )}

      <Footer variant="paper" contactLine="Da Nang · support@VoltCore.vn" />
    </>
  );
}
