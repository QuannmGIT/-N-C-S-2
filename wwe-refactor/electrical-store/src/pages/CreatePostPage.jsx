import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../lib/auth.jsx";
import { api } from "../lib/api.js";
import { usePageStylesheets } from "../lib/usePageStyles.js";
import ArticleContentBuilder from "../components/ArticleContentBuilder.jsx";

const MONO = "'JetBrains Mono', monospace";

const CATEGORIES = [
  { key: "Tutorials", label: "Tutorials (Hướng dẫn lập trình & chế tạo)", color: "var(--accent, #c8410f)" },
  { key: "Technical", label: "Technical (Kiến trúc & Phân tích kỹ thuật)", color: "var(--accent2, #1a6b4a)" },
  { key: "AI & IoT", label: "AI & IoT (Trí tuệ nhân tạo & Vạn vật kết nối)", color: "var(--accent3, #2563a8)" },
  { key: "Projects", label: "Projects (Dự án thực tế & DIY)", color: "#f59e0b" },
  { key: "Reviews", label: "Reviews (Đánh giá vi điều khiển & linh kiện)", color: "#8b5cf6" },
  { key: "Tips & Tricks", label: "Tips & Tricks (Mẹo vặt & Tối ưu hóa code)", color: "var(--accent2, #1a6b4a)" },
];

const SUGGESTED_TAGS = [
  "ESP32", "Arduino", "IoT", "C++", "MicroPython", "Raspberry Pi", "Robotics",
  "MQTT", "FreeRTOS", "BLE", "WiFi", "Sensors", "PCB Design", "KiCad"
];

export default function CreatePostPage() {
  const ready = usePageStylesheets([
    "/styles/variant/blog.css",
    "/styles/blog-page.css",
  ]);

  const { user, ready: authReady } = useAuth();
  const navigate = useNavigate();

  // Tab: "write" (Soạn bài) | "my-posts" (Bài viết của tôi)
  const [activeTab, setActiveTab] = useState("write");

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Tutorials");
  const [authorName, setAuthorName] = useState("");
  const [minutes, setMinutes] = useState(5);
  const [excerpt, setExcerpt] = useState("");
  const [img, setImg] = useState("");
  const [tags, setTags] = useState("");
  const [contentHtml, setContentHtml] = useState(
    `<h2 id="s0">Giới thiệu bài viết</h2>\n<p>Chia sẻ kinh nghiệm thực tế và giải pháp kỹ thuật của bạn tại đây...</p>`
  );

  // Editing state
  const [editingId, setEditingId] = useState(null);

  // States
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [draftSavedTime, setDraftSavedTime] = useState(null);

  // My posts list
  const [myPosts, setMyPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    document.title = editingId ? "Chỉnh sửa bài viết – VoltCore Blog" : "Đăng bài viết mới – VoltCore Blog";
  }, [editingId]);

  // Set default author name from logged in user
  useEffect(() => {
    if (user?.username && !authorName) {
      setAuthorName(user.username);
    }
  }, [user, authorName]);

  // Load draft from localStorage on first mount if not editing
  useEffect(() => {
    if (!editingId) {
      const savedDraft = localStorage.getItem("voltcore_post_draft");
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          if (draft.title) setTitle(draft.title);
          if (draft.category) setCategory(draft.category);
          if (draft.excerpt) setExcerpt(draft.excerpt);
          if (draft.img) setImg(draft.img);
          if (draft.tags) setTags(draft.tags);
          if (draft.contentHtml) setContentHtml(draft.contentHtml);
          if (draft.savedAt) setDraftSavedTime(draft.savedAt);
        } catch {
          // ignore corrupted draft
        }
      }
    }
  }, [editingId]);

  // Fetch my posts when tab is "my-posts"
  useEffect(() => {
    if (activeTab === "my-posts" && user) {
      fetchMyPosts();
    }
  }, [activeTab, user]);

  const fetchMyPosts = async () => {
    try {
      setLoadingPosts(true);
      const res = await api("/api/user/articles");
      if (res.ok && Array.isArray(res.data)) {
        setMyPosts(res.data);
      }
    } catch {
      setErrMsg("Không thể tải danh sách bài viết");
    } finally {
      setLoadingPosts(false);
    }
  };

  // Lưu bản nháp vào localStorage
  const handleSaveDraft = () => {
    const draft = {
      title,
      category,
      excerpt,
      img,
      tags,
      contentHtml,
      savedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };
    localStorage.setItem("voltcore_post_draft", JSON.stringify(draft));
    setDraftSavedTime(draft.savedAt);
    setSuccessMsg(`Đã lưu bản nháp lúc ${draft.savedAt}!`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Xóa bản nháp và reset form
  const handleResetForm = () => {
    if (window.confirm("Bạn có chắc chắn muốn đặt lại form không? Nội dung chưa lưu sẽ bị xóa.")) {
      setTitle("");
      setCategory("Tutorials");
      setExcerpt("");
      setImg("");
      setTags("");
      setContentHtml(`<h2 id="s0">Giới thiệu bài viết</h2>\n<p>Chia sẻ kinh nghiệm thực tế và giải pháp kỹ thuật của bạn tại đây...</p>`);
      setEditingId(null);
      localStorage.removeItem("voltcore_post_draft");
      setDraftSavedTime(null);
      setErrMsg("");
      setSuccessMsg("");
    }
  };

  // Xử lý upload ảnh bìa từ máy tính
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrMsg("Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrMsg("Kích thước ảnh tối đa là 8MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImg(event.target.result);
      setErrMsg("");
    };
    reader.readAsDataURL(file);
  };

  // Thêm nhanh tag gợi ý
  const handleAddTag = (tagText) => {
    const currentTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!currentTags.includes(tagText)) {
      setTags(currentTags.length > 0 ? `${tags}, ${tagText}` : tagText);
    }
  };

  // Nạp bài viết để chỉnh sửa
  const handleStartEdit = (post) => {
    setEditingId(post._id);
    setTitle(post.title || "");
    setCategory(post.category || "Tutorials");
    setAuthorName(post.authorName || user?.username || "");
    setMinutes(post.minutes || 5);
    setExcerpt(post.excerpt || "");
    setImg(post.img || "");
    setTags(Array.isArray(post.tags) ? post.tags.join(", ") : post.tags || "");
    setContentHtml(post.contentHtml || post.content || "");
    setActiveTab("write");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Hủy chỉnh sửa bài viết
  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setExcerpt("");
    setImg("");
    setTags("");
    setContentHtml(`<h2 id="s0">Giới thiệu bài viết</h2>\n<p>Chia sẻ kinh nghiệm thực tế và giải pháp kỹ thuật của bạn tại đây...</p>`);
  };

  // Xóa / ẩn bài viết
  const handleDeletePost = async (id, postTitle) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${postTitle}" không?`)) return;
    try {
      const res = await api(`/api/user/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessMsg(`Đã xóa bài viết "${postTitle}" thành công`);
        fetchMyPosts();
        setTimeout(() => setSuccessMsg(""), 3500);
      } else {
        setErrMsg(res.data?.error || "Không thể xóa bài viết");
      }
    } catch {
      setErrMsg("Lỗi kết nối khi xóa bài viết");
    }
  };

  // Submit bài viết
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    setSuccessMsg("");

    if (!title.trim()) {
      setErrMsg("Vui lòng nhập tiêu đề bài viết");
      return;
    }
    if (!contentHtml.trim()) {
      setErrMsg("Vui lòng nhập nội dung bài viết");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: title.trim(),
        category,
        authorName: authorName.trim() || user?.username || "Thành viên VoltCore",
        minutes: Number(minutes) > 0 ? Number(minutes) : 5,
        excerpt: excerpt.trim(),
        contentHtml,
        img: img.trim() || null,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      let res;
      if (editingId) {
        // Cập nhật bài viết hiện có
        res = await api(`/api/user/articles/${editingId}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        // Đăng bài viết mới
        res = await api("/api/articles", {
          method: "POST",
          body: payload,
        });
      }

      if (!res.ok) {
        setErrMsg(res.data?.error || "Đăng bài thất bại, vui lòng kiểm tra lại thông tin");
        return;
      }

      // Xóa draft nếu đăng thành công bài mới
      if (!editingId) {
        localStorage.removeItem("voltcore_post_draft");
      }

      const slug = res.data?.slug || res.data?.article?.slug;
      setSuccessMsg(editingId ? "Cập nhật bài viết thành công! Đang chuyển hướng..." : "Đăng bài viết thành công! Đang chuyển đến bài viết...");

      setTimeout(() => {
        if (slug) {
          navigate(`/blog/${slug}`);
        } else {
          navigate("/blog");
        }
      }, 1200);
    } catch (err) {
      setErrMsg(err?.message || "Lỗi máy chủ khi đăng bài viết");
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) return null;

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
      />

      <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "100px 5% 80px" }}>
        {/* NẾU CHƯA ĐĂNG NHẬP: HIỆN THẺ YÊU CẦU ĐĂNG NHẬP */}
        {authReady && !user ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid var(--border, rgba(26,22,18,0.1))",
              borderRadius: "18px",
              padding: "48px 36px",
              textAlign: "center",
              maxWidth: "600px",
              margin: "40px auto",
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>✍️</div>
            <h2
              style={{
                fontFamily: MONO,
                fontSize: "1.6rem",
                fontWeight: 800,
                color: "var(--ink, #1a1612)",
                marginBottom: "12px",
              }}
            >
              Đăng nhập để viết bài
            </h2>
            <p
              style={{
                color: "var(--ink2, #3d3630)",
                fontSize: "0.95rem",
                lineHeight: "1.7",
                marginBottom: "28px",
              }}
            >
              Bạn cần có tài khoản VoltCore để đăng tải và chia sẻ những bài viết, tài liệu kỹ thuật, hướng dẫn lập trình vi điều khiển đến cộng đồng.
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                to="/login"
                state={{ next: "/blog/create" }}
                style={{
                  background: "var(--accent, #c8410f)",
                  color: "#fff",
                  padding: "12px 28px",
                  borderRadius: "8px",
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                Đăng nhập ngay →
              </Link>
              <Link
                to="/signup"
                style={{
                  background: "var(--bg2, #ede9e0)",
                  color: "var(--ink, #1a1612)",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  border: "1px solid var(--border, rgba(26,22,18,0.1))",
                }}
              >
                Đăng ký tài khoản
              </Link>
            </div>
          </div>
        ) : (
          /* ĐÃ ĐĂNG NHẬP: GIAO DIỆN SOẠN BÀI & QUẢN LÝ BÀI VIẾT */
          <div>
            {/* TIÊU ĐỀ TRANG VÀ TAB CHUYỂN ĐỔI */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "28px",
                borderBottom: "1px solid var(--border, rgba(26,22,18,0.1))",
                paddingBottom: "18px",
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--accent, #c8410f)",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ width: 14, height: 2, background: "var(--accent, #c8410f)" }}></span>
                  Cổng tác giả cộng đồng · VoltCore Author
                </div>
                <h1
                  style={{
                    fontFamily: MONO,
                    fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                    fontWeight: 800,
                    color: "var(--ink, #1a1612)",
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  {editingId ? "⚙️ Chỉnh sửa bài viết" : "✍️ Đăng bài viết chia sẻ"}
                </h1>
              </div>

              {/* TABS: Soạn bài & Bài viết của tôi */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  style={{
                    background: activeTab === "write" ? "var(--ink, #1a1612)" : "var(--bg2, #ede9e0)",
                    color: activeTab === "write" ? "#fff" : "var(--ink, #1a1612)",
                    border: "1px solid var(--border, rgba(26,22,18,0.1))",
                    borderRadius: "8px",
                    padding: "8px 18px",
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  ✍️ {editingId ? "Đang sửa bài viết" : "Soạn bài viết mới"}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("my-posts")}
                  style={{
                    background: activeTab === "my-posts" ? "var(--ink, #1a1612)" : "var(--bg2, #ede9e0)",
                    color: activeTab === "my-posts" ? "#fff" : "var(--ink, #1a1612)",
                    border: "1px solid var(--border, rgba(26,22,18,0.1))",
                    borderRadius: "8px",
                    padding: "8px 18px",
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  📚 Bài viết của tôi {myPosts.length > 0 ? `(${myPosts.length})` : ""}
                </button>
              </div>
            </div>

            {/* THÔNG BÁO LỖI HOẶC THÀNH CÔNG */}
            {errMsg && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #f87171",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  color: "#991b1b",
                  fontFamily: MONO,
                  fontSize: "0.85rem",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>⚠️</span>
                <span>{errMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #4ade80",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  color: "#166534",
                  fontFamily: MONO,
                  fontSize: "0.85rem",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>✅</span>
                <span>{successMsg}</span>
              </div>
            )}

            {/* 1. TAB SOẠN BÀI VIẾT (WRITE TAB) */}
            {activeTab === "write" && (
              <form onSubmit={handleSubmit} noValidate>
                {/* THANH THÔNG TIN TÁC GIẢ & BẢN NHÁP */}
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid var(--border, rgba(26,22,18,0.1))",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    marginBottom: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: "var(--bg2, #ede9e0)",
                        border: "1px solid var(--border, rgba(26,22,18,0.1))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        overflow: "hidden",
                      }}
                    >
                      <img src="/assets/icons/userlogo.svg" alt="" style={{ width: 22, height: 22 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.78rem", color: "var(--ink3, #7a7068)" }}>Đăng bài với tên tác giả:</div>
                      <div style={{ fontWeight: 700, fontFamily: MONO, color: "var(--ink, #1a1612)", fontSize: "0.9rem" }}>
                        {authorName || user?.username} <span style={{ fontSize: "0.72rem", color: "var(--accent, #c8410f)", fontWeight: 500 }}>(@{user?.username})</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {draftSavedTime && (
                      <span style={{ fontSize: "0.74rem", color: "var(--ink3, #7a7068)" }}>
                        Bản nháp đã lưu: <strong>{draftSavedTime}</strong>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      style={{
                        background: "var(--bg2, #ede9e0)",
                        border: "1px solid var(--border, rgba(26,22,18,0.15))",
                        borderRadius: "6px",
                        padding: "6px 14px",
                        fontFamily: MONO,
                        fontSize: "0.76rem",
                        fontWeight: 600,
                        color: "var(--ink, #1a1612)",
                        cursor: "pointer",
                      }}
                    >
                      💾 Lưu nháp
                    </button>

                    {editingId ? (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        style={{
                          background: "none",
                          border: "1px solid #f87171",
                          color: "#991b1b",
                          borderRadius: "6px",
                          padding: "6px 14px",
                          fontFamily: MONO,
                          fontSize: "0.76rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        ❌ Hủy sửa
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResetForm}
                        style={{
                          background: "none",
                          border: "1px solid var(--border, rgba(26,22,18,0.15))",
                          color: "var(--ink3, #7a7068)",
                          borderRadius: "6px",
                          padding: "6px 14px",
                          fontFamily: MONO,
                          fontSize: "0.76rem",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        🔄 Làm mới
                      </button>
                    )}
                  </div>
                </div>

                {/* KHUNG NHẬP CƠ BẢN: TIÊU ĐỀ & CHUYÊN MỤC */}
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid var(--border, rgba(26,22,18,0.1))",
                    borderRadius: "14px",
                    padding: "24px 26px",
                    marginBottom: "24px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ display: "grid", gap: "20px" }}>
                    {/* TIÊU ĐỀ */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontFamily: MONO,
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: "var(--ink, #1a1612)",
                          marginBottom: "8px",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Tiêu đề bài viết <span style={{ color: "var(--accent, #c8410f)" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="vd: Hướng dẫn lập trình ESP32 kết nối MQTT Broker qua WiFi..."
                        required
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "12px 14px",
                          fontFamily: MONO,
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "var(--ink, #1a1612)",
                          background: "var(--bg, #f5f2ec)",
                          border: "1px solid var(--border, rgba(26,22,18,0.15))",
                          borderRadius: "8px",
                          outline: "none",
                        }}
                      />
                    </div>

                    {/* HÀNG 2 CỘT: CHUYÊN MỤC & THỜI GIAN ĐỌC */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontFamily: MONO,
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            color: "var(--ink, #1a1612)",
                            marginBottom: "8px",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Chuyên mục bài viết <span style={{ color: "var(--accent, #c8410f)" }}>*</span>
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "11px 14px",
                            fontFamily: MONO,
                            fontSize: "0.85rem",
                            color: "var(--ink, #1a1612)",
                            background: "var(--bg, #f5f2ec)",
                            border: "1px solid var(--border, rgba(26,22,18,0.15))",
                            borderRadius: "8px",
                            outline: "none",
                            cursor: "pointer",
                          }}
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat.key} value={cat.key}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            fontFamily: MONO,
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            color: "var(--ink, #1a1612)",
                            marginBottom: "8px",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Thời gian đọc ước tính (Phút)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={minutes}
                          onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "11px 14px",
                            fontFamily: MONO,
                            fontSize: "0.85rem",
                            color: "var(--ink, #1a1612)",
                            background: "var(--bg, #f5f2ec)",
                            border: "1px solid var(--border, rgba(26,22,18,0.15))",
                            borderRadius: "8px",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    {/* TÓM TẮT BÀI VIẾT (EXCERPT) */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontFamily: MONO,
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: "var(--ink, #1a1612)",
                          marginBottom: "8px",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Tóm tắt ngắn (Excerpt)
                      </label>
                      <textarea
                        rows={2}
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Mô tả súc tích nội dung chính của bài viết (hiển thị trên thẻ bài và kết quả tìm kiếm)..."
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "10px 14px",
                          fontFamily: MONO,
                          fontSize: "0.85rem",
                          color: "var(--ink, #1a1612)",
                          background: "var(--bg, #f5f2ec)",
                          border: "1px solid var(--border, rgba(26,22,18,0.15))",
                          borderRadius: "8px",
                          outline: "none",
                          resize: "vertical",
                          lineHeight: "1.5",
                        }}
                      />
                    </div>

                    {/* ẢNH BÌA BÀI VIẾT (COVER IMAGE) */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontFamily: MONO,
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: "var(--ink, #1a1612)",
                          marginBottom: "8px",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Ảnh bìa bài viết (Cover Image)
                      </label>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                          padding: "16px",
                          background: "var(--bg, #f5f2ec)",
                          border: "1px dashed var(--border, rgba(26,22,18,0.25))",
                          borderRadius: "10px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                          <label
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              background: "var(--ink, #1a1612)",
                              color: "#fff",
                              padding: "9px 18px",
                              borderRadius: "6px",
                              fontFamily: MONO,
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            <span>📁</span> Chọn ảnh từ máy tính
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              style={{ display: "none" }}
                            />
                          </label>

                          <span style={{ fontSize: "0.78rem", color: "var(--ink3, #7a7068)" }}>
                            hoặc dán đường dẫn ảnh:
                          </span>

                          <input
                            type="text"
                            value={img.startsWith("data:") ? "" : img}
                            onChange={(e) => setImg(e.target.value)}
                            placeholder="https://... hoặc /assets/img/..."
                            style={{
                              flex: 1,
                              minWidth: "220px",
                              padding: "9px 12px",
                              fontFamily: MONO,
                              fontSize: "0.8rem",
                              background: "#fff",
                              border: "1px solid var(--border, rgba(26,22,18,0.15))",
                              borderRadius: "6px",
                            }}
                          />

                          {img && (
                            <button
                              type="button"
                              onClick={() => setImg("")}
                              style={{
                                background: "none",
                                border: "1px solid #f87171",
                                color: "#991b1b",
                                borderRadius: "6px",
                                padding: "8px 12px",
                                fontFamily: MONO,
                                fontSize: "0.76rem",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Xóa ảnh
                            </button>
                          )}
                        </div>

                        {/* PREVIEW ẢNH BÌA */}
                        {img && (
                          <div style={{ marginTop: "8px" }}>
                            <div style={{ fontSize: "0.72rem", color: "var(--ink3, #7a7068)", marginBottom: "4px" }}>
                              Xem trước ảnh bìa:
                            </div>
                            <img
                              src={img}
                              alt="Ảnh bìa bài viết"
                              style={{
                                width: "100%",
                                maxHeight: "240px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                border: "1px solid var(--border, rgba(26,22,18,0.15))",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* THẺ PHÂN LOẠI (TAGS) */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontFamily: MONO,
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: "var(--ink, #1a1612)",
                          marginBottom: "8px",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Thẻ phân loại (Tags, cách nhau bởi dấu phẩy)
                      </label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="vd: ESP32, Arduino, MQTT, WiFi"
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "10px 14px",
                          fontFamily: MONO,
                          fontSize: "0.85rem",
                          color: "var(--ink, #1a1612)",
                          background: "var(--bg, #f5f2ec)",
                          border: "1px solid var(--border, rgba(26,22,18,0.15))",
                          borderRadius: "8px",
                          outline: "none",
                          marginBottom: "10px",
                        }}
                      />

                      {/* Gợi ý tags nhanh */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--ink3, #7a7068)", marginRight: "4px" }}>
                          Gợi ý thẻ nhanh:
                        </span>
                        {SUGGESTED_TAGS.map((tagItem) => (
                          <button
                            key={tagItem}
                            type="button"
                            onClick={() => handleAddTag(tagItem)}
                            style={{
                              background: "var(--bg2, #ede9e0)",
                              border: "1px solid var(--border, rgba(26,22,18,0.1))",
                              borderRadius: "100px",
                              padding: "3px 10px",
                              fontFamily: MONO,
                              fontSize: "0.7rem",
                              color: "var(--ink2, #3d3630)",
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            + {tagItem}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. TRÌNH DỰNG NỘI DUNG CHI TIẾT BÀI VIẾT (ARTICLE CONTENT BUILDER) */}
                <div style={{ marginBottom: "32px" }}>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "var(--ink, #1a1612)",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>⚡</span>
                    <span>Nội dung chi tiết bài viết (Dựng từng khối với tính năng định dạng &amp; xem trước chuẩn blog):</span>
                  </div>

                  <ArticleContentBuilder
                    value={contentHtml}
                    onChange={(newHtml) => setContentHtml(newHtml)}
                  />
                </div>

                {/* 3. NÚT SUBMIT ĐĂNG BÀI */}
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid var(--border, rgba(26,22,18,0.1))",
                    borderRadius: "14px",
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "14px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ fontSize: "0.8rem", color: "var(--ink3, #7a7068)" }}>
                    {editingId ? (
                      <span>Đang cập nhật bài viết sẵn có. Bấm để lưu thay đổi.</span>
                    ) : (
                      <span>Bài viết của bạn sẽ được hiển thị công khai ngay sau khi đăng.</span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      style={{
                        background: "var(--bg2, #ede9e0)",
                        border: "1px solid var(--border, rgba(26,22,18,0.15))",
                        borderRadius: "8px",
                        padding: "12px 22px",
                        fontFamily: MONO,
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "var(--ink, #1a1612)",
                        cursor: "pointer",
                      }}
                    >
                      💾 Lưu nháp
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        background: "var(--accent, #c8410f)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "12px 32px",
                        fontFamily: MONO,
                        fontSize: "0.92rem",
                        fontWeight: 800,
                        cursor: submitting ? "not-allowed" : "pointer",
                        boxShadow: "0 4px 14px rgba(200, 65, 15, 0.3)",
                        transition: "all 0.15s",
                      }}
                    >
                      {submitting ? "Đang gửi bài viết..." : editingId ? "💾 Cập nhật bài viết →" : "🚀 Đăng bài viết ngay →"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* 2. TAB QUẢN LÝ BÀI VIẾT CỦA TÔI (MY POSTS TAB) */}
            {activeTab === "my-posts" && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid var(--border, rgba(26,22,18,0.1))",
                  borderRadius: "14px",
                  padding: "26px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                    borderBottom: "1px solid var(--border, rgba(26,22,18,0.1))",
                    paddingBottom: "12px",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: MONO,
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "var(--ink, #1a1612)",
                      margin: 0,
                    }}
                  >
                    Danh sách bài viết bạn đã đăng ({myPosts.length})
                  </h3>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setActiveTab("write");
                    }}
                    style={{
                      background: "var(--accent, #c8410f)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 16px",
                      fontFamily: MONO,
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    + Viết bài mới
                  </button>
                </div>

                {loadingPosts ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "var(--ink3, #7a7068)", fontFamily: MONO }}>
                    Đang tải danh sách bài viết...
                  </div>
                ) : myPosts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "50px 20px" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📝</div>
                    <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: "1.05rem", color: "var(--ink, #1a1612)", marginBottom: "8px" }}>
                      Bạn chưa đăng bài viết nào
                    </div>
                    <p style={{ color: "var(--ink2, #3d3630)", fontSize: "0.88rem", marginBottom: "20px" }}>
                      Hãy bắt đầu chia sẻ dự án, thủ thuật lập trình hoặc đánh giá linh kiện đầu tiên của bạn!
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("write")}
                      style={{
                        background: "var(--accent, #c8410f)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 24px",
                        fontFamily: MONO,
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                      }}
                    >
                      Bắt đầu viết bài ngay →
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {myPosts.map((post) => (
                      <div
                        key={post._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "16px 18px",
                          background: "var(--bg, #f5f2ec)",
                          border: "1px solid var(--border, rgba(26,22,18,0.12))",
                          borderRadius: "10px",
                          gap: "16px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "260px" }}>
                          {/* Thumbnail */}
                          <div
                            style={{
                              width: 68,
                              height: 52,
                              borderRadius: "6px",
                              background: "var(--bg2, #ede9e0)",
                              overflow: "hidden",
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid var(--border, rgba(26,22,18,0.1))",
                            }}
                          >
                            {post.img ? (
                              <img
                                src={post.img}
                                alt=""
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <span style={{ fontSize: "24px" }}>🔌</span>
                            )}
                          </div>

                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  color: "var(--accent, #c8410f)",
                                  background: "var(--bg2, #ede9e0)",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  textTransform: "uppercase",
                                }}
                              >
                                {post.category}
                              </span>
                              <span style={{ fontSize: "0.72rem", color: "var(--ink3, #7a7068)" }}>
                                {post.published} · {post.minutes || 5} phút đọc
                              </span>
                            </div>

                            <Link
                              to={`/blog/${post.slug}`}
                              style={{
                                fontFamily: MONO,
                                fontWeight: 700,
                                fontSize: "0.95rem",
                                color: "var(--ink, #1a1612)",
                                textDecoration: "none",
                                display: "block",
                                lineHeight: "1.35",
                              }}
                            >
                              {post.title}
                            </Link>

                            <div style={{ fontSize: "0.74rem", color: "var(--ink3, #7a7068)", marginTop: "4px" }}>
                              👁️ {post.reads || 0} lượt đọc
                            </div>
                          </div>
                        </div>

                        {/* HÀNH ĐỘNG: XEM, SỬA, XÓA */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Link
                            to={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              background: "#fff",
                              border: "1px solid var(--border, rgba(26,22,18,0.15))",
                              color: "var(--ink, #1a1612)",
                              borderRadius: "6px",
                              padding: "6px 14px",
                              fontFamily: MONO,
                              fontSize: "0.76rem",
                              fontWeight: 600,
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            👁️ Xem bài
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(post)}
                            style={{
                              background: "var(--bg2, #ede9e0)",
                              border: "1px solid var(--border, rgba(26,22,18,0.15))",
                              color: "var(--ink, #1a1612)",
                              borderRadius: "6px",
                              padding: "6px 14px",
                              fontFamily: MONO,
                              fontSize: "0.76rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            ✏️ Sửa
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePost(post._id, post.title)}
                            style={{
                              background: "rgba(239, 68, 68, 0.08)",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              color: "#dc2626",
                              borderRadius: "6px",
                              padding: "6px 12px",
                              fontFamily: MONO,
                              fontSize: "0.76rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
