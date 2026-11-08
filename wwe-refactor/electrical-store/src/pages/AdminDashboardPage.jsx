import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { vnd } from "../lib/format.js";
import ArticleContentBuilder from "../components/ArticleContentBuilder.jsx";

const MONO = "'JetBrains Mono', monospace";

const CATEGORY_MAP = {
  iot: "IoT & Wireless",
  robotics: "Robotics",
  displays: "Displays",
  tools: "Tools",
};

const BLOG_CATEGORIES = [
  "Tutorials",
  "Projects",
  "Reviews",
  "Technical",
  "AI & IoT",
  "Tips & Tricks",
  "Hardware",
  "News",
];

export default function AdminDashboardPage({ defaultTab = "products" }) {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Dữ liệu bảng điều khiển
  const [stats, setStats] = useState(null);
  const [userList, setUserList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [articleList, setArticleList] = useState([]);
  const [actionAlert, setActionAlert] = useState(null);

  // Quản lý doanh thu & đơn hàng
  const [revenueData, setRevenueData] = useState(null);
  const [revenueFilter, setRevenueFilter] = useState({
    status: "all",
    paymentMethod: "all",
    search: "",
  });
  const [revenueLoading, setRevenueLoading] = useState(false);

  // Form thêm bài viết Blog mới
  const [articleForm, setArticleForm] = useState({
    title: "",
    category: "Tutorials",
    authorName: "VoltCore Dev Team",
    minutes: "5",
    excerpt: "",
    contentHtml: "",
    tags: "Arduino, ESP32, IoT",
    img: "", // Base64 data URL tải lên từ máy tính
    featured: false,
  });
  const [articleUploadedFileInfo, setArticleUploadedFileInfo] = useState(null);
  const [articleFormBusy, setArticleFormBusy] = useState(false);

  // Modal chỉnh sửa bài viết Blog
  const [editingArticle, setEditingArticle] = useState(null);
  const [editArticleForm, setEditArticleForm] = useState({
    title: "",
    category: "Tutorials",
    authorName: "VoltCore Dev Team",
    minutes: "5",
    excerpt: "",
    contentHtml: "",
    tags: "",
    img: "",
    featured: false,
  });
  const [editArticleUploadedFileInfo, setEditArticleUploadedFileInfo] = useState(null);
  const [editArticleBusy, setEditArticleBusy] = useState(false);

  // Form thêm sản phẩm mới
  const [prodForm, setProdForm] = useState({
    name: "",
    categoryKey: "iot",
    brand: "VoltCore",
    price: "",
    oldPrice: "",
    stock: "20",
    specs: "",
    badge: "",
    img: "", // Base64 data URL tải lên từ máy tính
  });
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);
  const [formBusy, setFormBusy] = useState(false);

  // Modal chỉnh sửa sản phẩm
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    categoryKey: "iot",
    brand: "VoltCore",
    price: "",
    oldPrice: "",
    stock: "20",
    specs: "",
    img: "",
  });
  const [editUploadedFileInfo, setEditUploadedFileInfo] = useState(null);
  const [editBusy, setEditBusy] = useState(false);

  // 1. Kiểm tra xác thực Admin
  useEffect(() => {
    document.title = "Dev & Admin Dashboard - VoltCore";
    api("/api/admin/me").then((res) => {
      if (!res.ok || !res.data?.loggedIn) {
        navigate("/admin/login");
      } else {
        setAdminUser(res.data);
        loadAllData();
      }
    });
  }, [navigate]);

  const showNotification = (msg, type = "success") => {
    setActionAlert({ msg, type });
    setTimeout(() => setActionAlert(null), 4000);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, prodsRes, articlesRes, revenueRes] = await Promise.all([
        api("/api/admin/stats"),
        api("/api/admin/users"),
        api("/api/admin/products"),
        api("/api/admin/articles"),
        api("/api/admin/revenue"),
      ]);

      if (statsRes.ok) setStats(statsRes.data);
      if (usersRes.ok) setUserList(usersRes.data);
      if (prodsRes.ok) setProductList(Array.isArray(prodsRes.data) ? prodsRes.data : []);
      if (articlesRes.ok) setArticleList(Array.isArray(articlesRes.data) ? articlesRes.data : []);
      if (revenueRes.ok) setRevenueData(revenueRes.data);
    } catch {
      showNotification("Không thể nạp dữ liệu thống kê", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    try {
      setRevenueLoading(true);
      const res = await api("/api/admin/revenue");
      if (res.ok) setRevenueData(res.data);
    } catch {
      showNotification("Không thể tải dữ liệu doanh thu", "error");
    } finally {
      setRevenueLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status, paymentStatus) => {
    try {
      const res = await api(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: { status, paymentStatus },
      });
      if (res.ok) {
        showNotification("Cập nhật trạng thái đơn hàng thành công!");
        fetchRevenueData();
      } else {
        showNotification(res.data?.error || "Cập nhật thất bại", "error");
      }
    } catch {
      showNotification("Lỗi kết nối khi cập nhật đơn hàng", "error");
    }
  };

  const handleDeleteOrder = async (orderId, orderCode) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng ${orderCode}?`)) return;
    try {
      const res = await api(`/api/admin/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) {
        showNotification(`Đã xóa đơn hàng ${orderCode}`);
        fetchRevenueData();
      } else {
        showNotification(res.data?.error || "Không thể xóa đơn hàng", "error");
      }
    } catch {
      showNotification("Lỗi kết nối khi xóa đơn hàng", "error");
    }
  };

  const handleLogout = async () => {
    await api("/api/admin/logout", {});
    navigate("/admin/login");
  };

  /**
   * Helper xử lý tối ưu hóa ảnh từ máy tính (nén & chuyển sang Base64 lưu vào MongoDB)
   */
  const handleImageFileChange = (file, callback) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showNotification("Vui lòng chọn file định dạng hình ảnh (PNG, JPG, WEBP)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Giới hạn kích thước tối đa 1000px để file nhẹ (~80KB-200KB) lưu trực tiếp vào MongoDB
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedBase64 = canvas.toDataURL("image/jpeg", 0.88);
        const approxSizeKb = Math.round((optimizedBase64.length * 3) / 4 / 1024);

        callback(optimizedBase64, {
          name: file.name,
          sizeKb: approxSizeKb,
          dimensions: `${width}×${height}px`,
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteUser = async (id, uname) => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng @${uname} khỏi MongoDB?`)) return;
    try {
      const res = await api(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification(`Đã xóa thành công @${uname}`);
        setUserList((prev) => prev.filter((u) => u.id !== id));
      } else {
        showNotification(res.data?.error || "Không thể xóa", "error");
      }
    } catch {
      showNotification("Lỗi kết nối khi xóa user", "error");
    }
  };

  // Thêm linh kiện mới kèm ảnh tải từ máy tính
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!prodForm.img) {
      showNotification("Vui lòng tải lên ảnh sản phẩm từ máy tính trước khi lưu!", "error");
      return;
    }

    const numPrice = Number(prodForm.price);
    const numStock = prodForm.stock !== "" ? Number(prodForm.stock) : 0;

    if (numPrice < 0) {
      showNotification("Giá sản phẩm không thể âm (phải >= 0)!", "error");
      return;
    }
    if (numStock < 0) {
      showNotification("Số lượng tồn kho không thể âm (phải >= 0)!", "error");
      return;
    }

    setFormBusy(true);
    try {
      const res = await api("/api/admin/products", {
        ...prodForm,
        price: numPrice,
        oldPrice: prodForm.oldPrice ? Number(prodForm.oldPrice) : null,
        stock: numStock,
      });

      if (res.ok) {
        showNotification(
          numStock <= 0
            ? `Đã thêm linh kiện "${prodForm.name}". Do tồn kho = 0, sản phẩm đã tự động bị ẩn khỏi cửa hàng!`
            : `Đã thêm linh kiện "${prodForm.name}" và lưu ảnh vào Database!`
        );
        setProdForm({
          name: "",
          categoryKey: "iot",
          brand: "VoltCore",
          price: "",
          oldPrice: "",
          stock: "20",
          specs: "",
          badge: "",
          img: "",
        });
        setUploadedFileInfo(null);
        loadAllData();
      } else {
        showNotification(res.data?.error || "Lỗi tạo sản phẩm", "error");
      }
    } catch {
      showNotification("Không thể kết nối máy chủ", "error");
    } finally {
      setFormBusy(false);
    }
  };

  // Mở modal chỉnh sửa
  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setEditUploadedFileInfo(null);
    setEditForm({
      name: p.name || "",
      categoryKey: p.categoryKey || p.category || "iot",
      brand: p.brand || "VoltCore",
      price: p.price !== undefined ? p.price : "",
      oldPrice: p.oldPrice !== undefined && p.oldPrice !== null ? p.oldPrice : "",
      stock: p.stock !== undefined ? p.stock : 20,
      specs: p.specs || "",
      img: p.img || "",
    });
  };

  // Lưu chỉnh sửa sản phẩm
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const numPrice = Number(editForm.price);
    const numStock = editForm.stock !== "" ? Number(editForm.stock) : 0;

    if (numPrice < 0) {
      showNotification("Giá sản phẩm không thể âm (phải >= 0)!", "error");
      return;
    }
    if (numStock < 0) {
      showNotification("Số lượng tồn kho không thể âm (phải >= 0)!", "error");
      return;
    }

    setEditBusy(true);
    const id = editingProduct._id || editingProduct.id;
    const autoHide = numStock <= 0;

    try {
      const res = await api(`/api/admin/products/${id}`, {
        method: "PUT",
        data: {
          ...editForm,
          price: numPrice,
          oldPrice: editForm.oldPrice ? Number(editForm.oldPrice) : null,
          stock: numStock,
        },
      });

      if (res.ok) {
        showNotification(
          autoHide
            ? `Đã cập nhật linh kiện "${editForm.name}". Do tồn kho = 0, sản phẩm đã tự động bị ẩn khỏi cửa hàng!`
            : `Đã cập nhật linh kiện "${editForm.name}" thành công!`
        );
        setProductList((prev) =>
          prev.map((item) =>
            (item._id || item.id) === id
              ? {
                  ...item,
                  ...editForm,
                  price: numPrice,
                  stock: numStock,
                  isDeleted: autoHide ? true : item.isDeleted,
                }
              : item
          )
        );
        setEditingProduct(null);
      } else {
        showNotification(res.data?.error || "Lỗi cập nhật sản phẩm", "error");
      }
    } catch {
      showNotification("Không thể kết nối máy chủ", "error");
    } finally {
      setEditBusy(false);
    }
  };

  // Xóa mềm / Ẩn sản phẩm khỏi cửa hàng (trang quản lý vẫn thấy)
  const handleToggleHideProduct = async () => {
    if (!editingProduct) return;
    const id = editingProduct._id || editingProduct.id;
    try {
      const res = await api(`/api/admin/products/${id}/toggle-hide`, {
        method: "PATCH",
      });

      if (res.ok) {
        const isHidden = res.data.isDeleted;
        showNotification(
          isHidden
            ? `Đã ẩn "${editingProduct.name}" khỏi cửa hàng (Trang quản lý vẫn thấy)`
            : `Đã khôi phục "${editingProduct.name}" hiển thị trên cửa hàng`
        );
        setProductList((prev) =>
          prev.map((item) =>
            (item._id || item.id) === id ? { ...item, isDeleted: isHidden } : item
          )
        );
        setEditingProduct((prev) => ({ ...prev, isDeleted: isHidden }));
      } else {
        showNotification(res.data?.error || "Lỗi thay đổi trạng thái ẩn", "error");
      }
    } catch {
      showNotification("Không thể kết nối máy chủ", "error");
    }
  };

  // Quản lý Blog: Thêm bài viết mới
  const handleCreateArticle = async (e) => {
    e.preventDefault();
    if (!articleForm.title.trim()) {
      showNotification("Vui lòng nhập tiêu đề bài viết!", "error");
      return;
    }
    setArticleFormBusy(true);
    try {
      const res = await api("/api/admin/articles", {
        method: "POST",
        data: {
          ...articleForm,
          minutes: Number(articleForm.minutes) > 0 ? Number(articleForm.minutes) : 5,
        },
      });
      if (res.ok && res.data?.article) {
        showNotification(`Đã xuất bản bài viết "${res.data.article.title}" lên Blog thành công!`);
        setArticleList((prev) => [res.data.article, ...prev]);
        setArticleForm({
          title: "",
          category: "Tutorials",
          authorName: adminUser?.username ? `@${adminUser.username}` : "VoltCore Dev Team",
          minutes: "5",
          excerpt: "",
          contentHtml: "",
          tags: "Arduino, ESP32, IoT",
          img: "",
          featured: false,
        });
        setArticleUploadedFileInfo(null);
      } else {
        showNotification(res.data?.error || "Lỗi tạo bài viết", "error");
      }
    } catch {
      showNotification("Không thể kết nối máy chủ", "error");
    } finally {
      setArticleFormBusy(false);
    }
  };

  // Quản lý Blog: Mở modal chỉnh sửa
  const handleOpenEditArticle = (art) => {
    setEditingArticle(art);
    setEditArticleUploadedFileInfo(null);
    setEditArticleForm({
      title: art.title || "",
      category: art.category || "Tutorials",
      authorName: art.authorName || "VoltCore Dev Team",
      minutes: String(art.minutes || 5),
      excerpt: art.excerpt || "",
      contentHtml: art.contentHtml || "",
      tags: Array.isArray(art.tags) ? art.tags.join(", ") : (art.tags || ""),
      img: art.img || "",
      featured: Boolean(art.featured),
    });
  };

  // Quản lý Blog: Lưu chỉnh sửa bài viết
  const handleSaveEditArticle = async (e) => {
    e.preventDefault();
    if (!editingArticle) return;
    if (!editArticleForm.title.trim()) {
      showNotification("Vui lòng nhập tiêu đề bài viết!", "error");
      return;
    }
    setEditArticleBusy(true);
    const id = editingArticle._id || editingArticle.id;
    try {
      const res = await api(`/api/admin/articles/${id}`, {
        method: "PUT",
        data: {
          ...editArticleForm,
          minutes: Number(editArticleForm.minutes) > 0 ? Number(editArticleForm.minutes) : 5,
        },
      });
      if (res.ok && res.data?.article) {
        showNotification(`Đã cập nhật bài viết "${res.data.article.title}" thành công!`);
        setArticleList((prev) =>
          prev.map((item) => ((item._id || item.id) === id ? res.data.article : item))
        );
        setEditingArticle(null);
      } else {
        showNotification(res.data?.error || "Lỗi cập nhật bài viết", "error");
      }
    } catch {
      showNotification("Không thể kết nối máy chủ", "error");
    } finally {
      setEditArticleBusy(false);
    }
  };

  // Quản lý Blog: Bật/Tắt ẩn bài viết (Xóa mềm - Ẩn khỏi blog, Admin vẫn thấy)
  const handleToggleHideArticle = async () => {
    if (!editingArticle) return;
    const id = editingArticle._id || editingArticle.id;
    try {
      const res = await api(`/api/admin/articles/${id}/toggle-hide`, {
        method: "PATCH",
      });
      if (res.ok) {
        const isHidden = res.data.isDeleted;
        showNotification(
          isHidden
            ? `Đã ẩn bài viết "${editingArticle.title}" khỏi Blog (Trang quản lý vẫn thấy)`
            : `Đã khôi phục hiển thị "${editingArticle.title}" trên Blog`
        );
        setArticleList((prev) =>
          prev.map((item) =>
            (item._id || item.id) === id ? { ...item, isDeleted: isHidden } : item
          )
        );
        setEditingArticle((prev) => ({ ...prev, isDeleted: isHidden }));
      } else {
        showNotification(res.data?.error || "Lỗi thay đổi trạng thái ẩn", "error");
      }
    } catch {
      showNotification("Không thể kết nối máy chủ", "error");
    }
  };

  // Quản lý Blog: Xóa vĩnh viễn bài viết khỏi MongoDB
  const handleDeleteArticle = async (id, title) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn bài viết "${title}" khỏi MongoDB?`)) return;
    try {
      const res = await api(`/api/admin/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification(`Đã xóa bài viết "${title}"`);
        setArticleList((prev) => prev.filter((item) => (item._id || item.id) !== id));
        if (editingArticle && (editingArticle._id || editingArticle.id) === id) {
          setEditingArticle(null);
        }
      } else {
        showNotification(res.data?.error || "Lỗi xóa bài viết", "error");
      }
    } catch {
      showNotification("Không thể kết nối máy chủ", "error");
    }
  };

  const handleResetSeed = async () => {
    if (!window.confirm("Nạp lại dữ liệu mẫu (16 linh kiện, 4 danh mục) vào MongoDB?")) return;
    try {
      const res = await api("/api/admin/reset-seed", {});
      if (res.ok) {
        showNotification("Đã nạp lại dữ liệu thành công!");
        loadAllData();
      }
    } catch {
      showNotification("Lỗi kết nối", "error");
    }
  };

  if (!adminUser) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080c10",
        color: "#e8edf2",
        fontFamily: MONO,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 1. TOP HEADER CONSOLE */}
      <header
        style={{
          background: "rgba(14, 21, 32, 0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0, 229, 255, 0.15)",
          padding: "14px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#00ff88",
              boxShadow: "0 0 10px #00ff88",
            }}
          />
          <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>
            VOLTCORE <span style={{ color: "#00e5ff" }}>DEV_CONSOLE</span>
          </span>
          <span
            style={{
              fontSize: "0.72rem",
              background: "rgba(0, 229, 255, 0.1)",
              border: "1px solid rgba(0, 229, 255, 0.3)",
              color: "#00e5ff",
              padding: "2px 8px",
              borderRadius: 4,
            }}
          >
            v2.4-STABLE
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "0.8rem", color: "#7a8fa6" }}>
            Admin: <strong style={{ color: "#00ff88" }}>@{adminUser.username}</strong>
          </span>

          <Link
            to="/"
            style={{
              color: "#7a8fa6",
              textDecoration: "none",
              fontSize: "0.78rem",
              padding: "6px 12px",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px",
              transition: "color 0.2s",
            }}
          >
            🌐 Xem trang chủ
          </Link>

          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255, 75, 75, 0.1)",
              border: "1px solid rgba(255, 75, 75, 0.3)",
              color: "#ff4b4b",
              padding: "6px 14px",
              borderRadius: "6px",
              fontFamily: "inherit",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* THÔNG BÁO TOAST THAO TÁC */}
      {actionAlert && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: actionAlert.type === "error" ? "#ff4b4b" : "#00ff88",
            color: "#000",
            padding: "12px 20px",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.82rem",
            boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
            zIndex: 9999,
          }}
        >
          {actionAlert.msg}
        </div>
      )}

      {/* 2. TAB CONTROLS */}
      <div
        style={{
          padding: "16px 28px 0",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          gap: "8px",
          background: "#0a0f16",
        }}
      >
        {[
          { key: "revenue", label: `💰 Quản lý doanh thu (${revenueData?.orders?.length || 0})` },
          { key: "products", label: `📦 Quản lý linh kiện (${productList.length})` },
          { key: "articles", label: `📰 Quản lý bài viết Blog (${articleList.length})` },
          { key: "overview", label: "📊 Tổng quan hệ thống" },
          { key: "users", label: `👥 Quản lý người dùng (${userList.length})` },
          { key: "system", label: "⚙️ Máy chủ & Database" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 18px",
              background: activeTab === tab.key ? "#141f2d" : "transparent",
              color: activeTab === tab.key ? "#00e5ff" : "#7a8fa6",
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid #00e5ff" : "2px solid transparent",
              fontFamily: "inherit",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. NỘI DUNG TỪNG TAB */}
      <main style={{ padding: "28px", flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#7a8fa6" }}>
            Đang tải dữ liệu Dev Console...
          </div>
        ) : (
          <>
            {/* TAB: QUẢN LÝ DOANH THU & ĐƠN HÀNG */}
            {activeTab === "revenue" && (
              <div style={{ display: "grid", gap: "24px" }}>
                {/* 1. HÀNG THẺ THỐNG KÊ DOANH THU (KPI CARDS) */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {/* DOANH THU THỰC TẾ (PAID) */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, rgba(0, 255, 136, 0.12), rgba(0, 229, 255, 0.05))",
                      border: "1px solid rgba(0, 255, 136, 0.35)",
                      borderRadius: "12px",
                      padding: "20px 22px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "0.74rem", fontFamily: MONO, color: "#7a8fa6", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Tổng doanh thu thực tế (PAID)
                      </span>
                      <span style={{ fontSize: "1.3rem" }}>💰</span>
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: "1.6rem", fontWeight: 800, color: "#00ff88", letterSpacing: "-0.02em" }}>
                      {vnd(revenueData?.summary?.totalRevenue || 0)}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#7a8fa6", marginTop: "6px" }}>
                      ⚡ VietQR: <strong style={{ color: "#00e5ff" }}>{vnd(revenueData?.summary?.vietqrRevenue || 0)}</strong> · COD: {vnd(revenueData?.summary?.codRevenue || 0)}
                    </div>
                  </div>

                  {/* DOANH THU CHỜ THANH TOÁN (UNPAID) */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.04))",
                      border: "1px solid rgba(245, 158, 11, 0.35)",
                      borderRadius: "12px",
                      padding: "20px 22px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "0.74rem", fontFamily: MONO, color: "#7a8fa6", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Đang chờ thanh toán (UNPAID)
                      </span>
                      <span style={{ fontSize: "1.3rem" }}>⏳</span>
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: "1.6rem", fontWeight: 800, color: "#fbbf24", letterSpacing: "-0.02em" }}>
                      {vnd(revenueData?.summary?.pendingRevenue || 0)}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#7a8fa6", marginTop: "6px" }}>
                      <strong style={{ color: "#fbbf24" }}>{revenueData?.summary?.unpaidOrdersCount || 0}</strong> đơn hàng đang chờ khách quét VietQR
                    </div>
                  </div>

                  {/* TỔNG ĐƠN HÀNG */}
                  <div
                    style={{
                      background: "#0d141e",
                      border: "1px solid rgba(0, 229, 255, 0.25)",
                      borderRadius: "12px",
                      padding: "20px 22px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "0.74rem", fontFamily: MONO, color: "#7a8fa6", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Tổng số đơn hàng
                      </span>
                      <span style={{ fontSize: "1.3rem" }}>📦</span>
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: "1.6rem", fontWeight: 800, color: "#00e5ff" }}>
                      {revenueData?.summary?.totalOrders || 0} <span style={{ fontSize: "0.9rem", color: "#7a8fa6", fontWeight: 500 }}>đơn</span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#7a8fa6", marginTop: "6px" }}>
                      ✅ <strong style={{ color: "#00ff88" }}>{revenueData?.summary?.paidOrdersCount || 0}</strong> đã trả · ❌ {revenueData?.summary?.cancelledOrdersCount || 0} đã hủy
                    </div>
                  </div>

                  {/* GIÁ TRỊ TRUNG BÌNH ĐƠN (AOV) */}
                  <div
                    style={{
                      background: "#0d141e",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "12px",
                      padding: "20px 22px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "0.74rem", fontFamily: MONO, color: "#7a8fa6", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Giá trị trung bình đơn (AOV)
                      </span>
                      <span style={{ fontSize: "1.3rem" }}>🎯</span>
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: "1.6rem", fontWeight: 800, color: "#e8edf2" }}>
                      {vnd(revenueData?.summary?.aov || 0)}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#7a8fa6", marginTop: "6px" }}>
                      Tính trên các đơn đã thanh toán thành công
                    </div>
                  </div>
                </div>

                {/* 2. BỘ LỌC ĐƠN HÀNG & TÌM KIẾM */}
                <div
                  style={{
                    background: "#0d141e",
                    border: "1px solid rgba(0, 229, 255, 0.2)",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", flex: 1 }}>
                    {/* Tìm kiếm */}
                    <input
                      type="text"
                      placeholder="Tìm theo mã đơn (VC-...), tên khách, SĐT..."
                      value={revenueFilter.search}
                      onChange={(e) => setRevenueFilter((prev) => ({ ...prev, search: e.target.value }))}
                      style={{
                        padding: "8px 12px",
                        background: "#05080c",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "6px",
                        color: "#fff",
                        fontFamily: MONO,
                        fontSize: "0.8rem",
                        width: "280px",
                      }}
                    />

                    {/* Lọc trạng thái thanh toán */}
                    <select
                      value={revenueFilter.status}
                      onChange={(e) => setRevenueFilter((prev) => ({ ...prev, status: e.target.value }))}
                      style={{
                        padding: "8px 12px",
                        background: "#05080c",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "6px",
                        color: "#00e5ff",
                        fontFamily: MONO,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      <option value="all">Tất cả thanh toán</option>
                      <option value="PAID">✅ Đã thanh toán (PAID)</option>
                      <option value="UNPAID">⏳ Chưa thanh toán (UNPAID)</option>
                    </select>

                    {/* Lọc phương thức thanh toán */}
                    <select
                      value={revenueFilter.paymentMethod}
                      onChange={(e) => setRevenueFilter((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                      style={{
                        padding: "8px 12px",
                        background: "#05080c",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "6px",
                        color: "#e8edf2",
                        fontFamily: MONO,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      <option value="all">Tất cả phương thức</option>
                      <option value="BANK_TRANSFER">⚡ Chuyển khoản VietQR</option>
                      <option value="COD">📦 Tiền mặt (COD)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={fetchRevenueData}
                    disabled={revenueLoading}
                    style={{
                      background: "rgba(0, 229, 255, 0.1)",
                      border: "1px solid rgba(0, 229, 255, 0.3)",
                      color: "#00e5ff",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontFamily: MONO,
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: revenueLoading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>🔄</span>
                    <span>{revenueLoading ? "Đang tải..." : "Làm mới dữ liệu"}</span>
                  </button>
                </div>

                {/* 3. BẢNG DANH SÁCH ĐƠN HÀNG & HÓA ĐƠN CHI TIẾT */}
                <div
                  style={{
                    background: "#0d141e",
                    border: "1px solid rgba(0, 229, 255, 0.2)",
                    borderRadius: "12px",
                    padding: "20px",
                    overflowX: "auto",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      paddingBottom: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "1.1rem" }}>📋</span>
                      <h3 style={{ fontSize: "0.95rem", color: "#00e5ff", margin: 0, fontFamily: MONO, fontWeight: 700 }}>
                        Danh sách hóa đơn &amp; giao dịch ({
                          (revenueData?.orders || []).filter((ord) => {
                            const matchStatus = revenueFilter.status === "all" || ord.paymentStatus === revenueFilter.status;
                            const matchMethod = revenueFilter.paymentMethod === "all" || ord.paymentMethod === revenueFilter.paymentMethod;
                            const q = revenueFilter.search.toLowerCase().trim();
                            const matchSearch = !q || ord.orderCode.toLowerCase().includes(q) || ord.shipping?.fullName?.toLowerCase().includes(q) || ord.shipping?.phone?.includes(q);
                            return matchStatus && matchMethod && matchSearch;
                          }).length
                        })
                      </h3>
                    </div>
                  </div>

                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.8rem",
                      fontFamily: MONO,
                      textAlign: "left",
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.12)", color: "#7a8fa6" }}>
                        <th style={{ padding: "10px 12px" }}>MÃ ĐƠN HÀNG</th>
                        <th style={{ padding: "10px 12px" }}>KHÁCH HÀNG</th>
                        <th style={{ padding: "10px 12px" }}>LINH KIỆN MUA</th>
                        <th style={{ padding: "10px 12px" }}>TỔNG TIỀN</th>
                        <th style={{ padding: "10px 12px" }}>PHƯƠNG THỨC</th>
                        <th style={{ padding: "10px 12px" }}>THANH TOÁN</th>
                        <th style={{ padding: "10px 12px" }}>TIẾN ĐỘ ĐƠN</th>
                        <th style={{ padding: "10px 12px", textAlign: "right" }}>THAO TÁC DEV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(revenueData?.orders || [])
                        .filter((ord) => {
                          const matchStatus = revenueFilter.status === "all" || ord.paymentStatus === revenueFilter.status;
                          const matchMethod = revenueFilter.paymentMethod === "all" || ord.paymentMethod === revenueFilter.paymentMethod;
                          const q = revenueFilter.search.toLowerCase().trim();
                          const matchSearch = !q || ord.orderCode.toLowerCase().includes(q) || ord.shipping?.fullName?.toLowerCase().includes(q) || ord.shipping?.phone?.includes(q);
                          return matchStatus && matchMethod && matchSearch;
                        })
                        .map((ord) => (
                          <tr
                            key={ord._id}
                            style={{
                              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                              transition: "background 0.15s",
                            }}
                          >
                            {/* Cột 1: Mã đơn & thời gian */}
                            <td style={{ padding: "12px", verticalAlign: "top" }}>
                              <Link
                                to={`/payment/${ord.orderCode}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  color: "#00e5ff",
                                  fontWeight: 700,
                                  textDecoration: "none",
                                  display: "block",
                                  marginBottom: "4px",
                                }}
                              >
                                {ord.orderCode} ↗
                              </Link>
                              <span style={{ fontSize: "0.72rem", color: "#546e7a" }}>
                                {new Date(ord.createdAt).toLocaleDateString("vi-VN")} {new Date(ord.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </td>

                            {/* Cột 2: Khách hàng */}
                            <td style={{ padding: "12px", verticalAlign: "top" }}>
                              <div style={{ fontWeight: 700, color: "#fff" }}>{ord.shipping?.fullName}</div>
                              <div style={{ color: "#7a8fa6", fontSize: "0.74rem" }}>{ord.shipping?.phone}</div>
                              <div style={{ color: "#546e7a", fontSize: "0.7rem", marginTop: "2px", maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {ord.shipping?.province}
                              </div>
                            </td>

                            {/* Cột 3: Linh kiện mua */}
                            <td style={{ padding: "12px", verticalAlign: "top" }}>
                              <div style={{ color: "#e8edf2", maxWidth: 220 }}>
                                {(ord.items || []).map((it, idx) => (
                                  <div key={idx} style={{ fontSize: "0.74rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    • {it.name} <span style={{ color: "#00e5ff" }}>×{it.quantity}</span>
                                  </div>
                                ))}
                              </div>
                              <div style={{ fontSize: "0.7rem", color: "#546e7a", marginTop: "2px" }}>
                                Tổng: {ord.itemCount} sản phẩm
                              </div>
                            </td>

                            {/* Cột 4: Tổng tiền */}
                            <td style={{ padding: "12px", verticalAlign: "top" }}>
                              <div style={{ fontWeight: 800, color: ord.paymentStatus === "PAID" ? "#00ff88" : "#fbbf24", fontSize: "0.92rem" }}>
                                {vnd(ord.totalAmount)}
                              </div>
                              {ord.shippingFee > 0 && (
                                <div style={{ fontSize: "0.68rem", color: "#546e7a" }}>
                                  (Ship: {vnd(ord.shippingFee)})
                                </div>
                              )}
                            </td>

                            {/* Cột 5: Phương thức */}
                            <td style={{ padding: "12px", verticalAlign: "top" }}>
                              {ord.paymentMethod === "BANK_TRANSFER" ? (
                                <span style={{ color: "#00e5ff", fontWeight: 600 }}>
                                  ⚡ VietQR
                                </span>
                              ) : (
                                <span style={{ color: "#e8edf2" }}>
                                  📦 COD
                                </span>
                              )}
                            </td>

                            {/* Cột 6: Trạng thái thanh toán */}
                            <td style={{ padding: "12px", verticalAlign: "top" }}>
                              {ord.paymentStatus === "PAID" ? (
                                <span
                                  style={{
                                    background: "rgba(0, 255, 136, 0.12)",
                                    border: "1px solid rgba(0, 255, 136, 0.35)",
                                    color: "#00ff88",
                                    padding: "3px 8px",
                                    borderRadius: "4px",
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                  }}
                                >
                                  ✅ ĐÃ TRẢ
                                </span>
                              ) : (
                                <span
                                  style={{
                                    background: "rgba(245, 158, 11, 0.12)",
                                    border: "1px solid rgba(245, 158, 11, 0.35)",
                                    color: "#fbbf24",
                                    padding: "3px 8px",
                                    borderRadius: "4px",
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                  }}
                                >
                                  ⏳ CHỜ TRẢ
                                </span>
                              )}
                            </td>

                            {/* Cột 7: Tiến độ đơn hàng */}
                            <td style={{ padding: "12px", verticalAlign: "top" }}>
                              <select
                                value={ord.status}
                                onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value, ord.paymentStatus)}
                                style={{
                                  padding: "4px 8px",
                                  background: "#05080c",
                                  border: "1px solid rgba(255, 255, 255, 0.15)",
                                  borderRadius: "4px",
                                  color:
                                    ord.status === "COMPLETED"
                                      ? "#00ff88"
                                      : ord.status === "CANCELLED"
                                      ? "#f87171"
                                      : ord.status === "SHIPPING"
                                      ? "#00e5ff"
                                      : "#fbbf24",
                                  fontFamily: MONO,
                                  fontSize: "0.72rem",
                                  cursor: "pointer",
                                }}
                              >
                                <option value="PENDING">Chờ xử lý (PENDING)</option>
                                <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
                                <option value="SHIPPING">Đang giao (SHIPPING)</option>
                                <option value="COMPLETED">Hoàn tất (COMPLETED)</option>
                                <option value="CANCELLED">Đã hủy (CANCELLED)</option>
                              </select>
                            </td>

                            {/* Cột 8: Thao tác Dev */}
                            <td style={{ padding: "12px", verticalAlign: "top", textAlign: "right" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                                {ord.paymentStatus !== "PAID" && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateOrderStatus(ord._id, "CONFIRMED", "PAID")}
                                    title="Xác nhận đã nhận chuyển khoản VietQR"
                                    style={{
                                      background: "rgba(0, 255, 136, 0.12)",
                                      border: "1px solid rgba(0, 255, 136, 0.35)",
                                      color: "#00ff88",
                                      padding: "3px 8px",
                                      borderRadius: "4px",
                                      fontFamily: MONO,
                                      fontSize: "0.7rem",
                                      fontWeight: 700,
                                      cursor: "pointer",
                                    }}
                                  >
                                    ✓ Gạch nợ
                                  </button>
                                )}

                                <Link
                                  to={`/payment/${ord.orderCode}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Xem hóa đơn thanh toán VietQR"
                                  style={{
                                    background: "rgba(0, 229, 255, 0.1)",
                                    border: "1px solid rgba(0, 229, 255, 0.3)",
                                    color: "#00e5ff",
                                    padding: "3px 8px",
                                    borderRadius: "4px",
                                    fontFamily: MONO,
                                    fontSize: "0.7rem",
                                    textDecoration: "none",
                                    fontWeight: 600,
                                  }}
                                >
                                  👁️ Hóa đơn
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteOrder(ord._id, ord.orderCode)}
                                  title="Xóa đơn hàng này"
                                  style={{
                                    background: "rgba(239, 68, 68, 0.1)",
                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                    color: "#f87171",
                                    padding: "3px 8px",
                                    borderRadius: "4px",
                                    fontFamily: MONO,
                                    fontSize: "0.7rem",
                                    cursor: "pointer",
                                  }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                      {(revenueData?.orders || []).length === 0 && (
                        <tr>
                          <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#546e7a" }}>
                            Chưa có đơn hàng nào được tạo trên hệ thống.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 4. TOP SẢN PHẨM MANG LẠI DOANH THU CAO NHẤT */}
                {(revenueData?.topProducts || []).length > 0 && (
                  <div
                    style={{
                      background: "#0d141e",
                      border: "1px solid rgba(0, 229, 255, 0.2)",
                      borderRadius: "12px",
                      padding: "20px 24px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                      <span style={{ fontSize: "1.1rem" }}>🏆</span>
                      <h3 style={{ fontSize: "0.95rem", color: "#00e5ff", margin: 0, fontFamily: MONO, fontWeight: 700 }}>
                        Top linh kiện đem lại doanh thu cao nhất
                      </h3>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: "14px",
                      }}
                    >
                      {revenueData.topProducts.map((prod, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: "#05080c",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            borderRadius: "8px",
                            padding: "12px 14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "6px",
                              background: "#0a0f16",
                              border: "1px solid rgba(255,255,255,0.08)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                              flexShrink: 0,
                            }}
                          >
                            {prod.image ? (
                              <img src={prod.image} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                            ) : (
                              <span>🔌</span>
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: MONO, fontSize: "0.78rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {prod.name}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "#7a8fa6" }}>
                              Đã bán: <strong style={{ color: "#00e5ff" }}>{prod.quantity}</strong> cái
                            </div>
                            <div style={{ fontFamily: MONO, fontSize: "0.82rem", fontWeight: 800, color: "#00ff88" }}>
                              {vnd(prod.revenue)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: QUẢN LÝ LINH KIỆN */}
            {activeTab === "products" && (
              <div style={{ display: "grid", gap: "24px" }}>
                {/* Form Thêm Sản Phẩm Mới */}
                <div
                  style={{
                    background: "#0d141e",
                    border: "1px solid rgba(0, 229, 255, 0.2)",
                    borderRadius: "12px",
                    padding: "24px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1rem",
                      color: "#00e5ff",
                      marginBottom: "18px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    ➕ Thêm linh kiện mới vào kho
                  </h3>
                  <form
                    onSubmit={handleCreateProduct}
                    style={{
                      display: "grid",
                      gap: "16px",
                    }}
                  >
                    {/* 4 CỘT CÁCH ĐỀU NHAU 100%: Tên sản phẩm, Danh mục, Giá bán, Tồn kho */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                        gap: "16px",
                        width: "100%",
                      }}
                    >
                      <div style={{ width: "100%" }}>
                        <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 6 }}>
                          Tên sản phẩm *
                        </label>
                        <input
                          type="text"
                          placeholder="vd: ESP32-CAM AI Thinker"
                          value={prodForm.name}
                          onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                          required
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "9px 12px",
                            background: "#080c10",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 6,
                            color: "#fff",
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                          }}
                        />
                      </div>

                      <div style={{ width: "100%" }}>
                        <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 6 }}>
                          Danh mục *
                        </label>
                        <select
                          value={prodForm.categoryKey}
                          onChange={(e) => setProdForm({ ...prodForm, categoryKey: e.target.value })}
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "9px 12px",
                            background: "#080c10",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 6,
                            color: "#fff",
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                          }}
                        >
                          <option value="iot">IoT & Wireless</option>
                          <option value="robotics">Robotics</option>
                          <option value="displays">Displays</option>
                          <option value="tools">Tools</option>
                        </select>
                      </div>

                      <div style={{ width: "100%" }}>
                        <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 6 }}>
                          Giá bán (VNĐ)
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="vd: 125000"
                          value={prodForm.price}
                          onKeyDown={(e) => {
                            if (e.key === "-" || e.key === "e") e.preventDefault();
                          }}
                          onChange={(e) => {
                            const val = e.target.value === "" ? "" : Math.max(0, Number(e.target.value));
                            setProdForm({ ...prodForm, price: val });
                          }}
                          required
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "9px 12px",
                            background: "#080c10",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 6,
                            color: "#00ff88",
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                          }}
                        />
                      </div>

                      <div style={{ width: "100%" }}>
                        <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 6 }}>
                          Số lượng tồn kho
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={prodForm.stock}
                          onKeyDown={(e) => {
                            if (e.key === "-" || e.key === "e") e.preventDefault();
                          }}
                          onChange={(e) => {
                            const val = e.target.value === "" ? "" : Math.max(0, Number(e.target.value));
                            setProdForm({ ...prodForm, stock: val });
                          }}
                          required
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "9px 12px",
                            background: "#080c10",
                            border:
                              Number(prodForm.stock) === 0
                                ? "1px solid #ff7675"
                                : "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 6,
                            color: Number(prodForm.stock) === 0 ? "#ff7675" : "#fff",
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                          }}
                        />
                        {Number(prodForm.stock) === 0 && (
                          <div style={{ fontSize: "0.7rem", color: "#ff7675", marginTop: 4 }}>
                            ⚠️ Tồn kho = 0: Sản phẩm sẽ tự động bị ẩn khỏi cửa hàng
                          </div>
                        )}
                      </div>
                    </div>

                    {/* HÌNH ẢNH SẢN PHẨM: UPLOAD TỪ MÁY TÍNH & LƯU VÀO DATABASE */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 6 }}>
                        Hình ảnh sản phẩm * (Tải ảnh từ máy tính để lưu trực tiếp vào Database MongoDB)
                      </label>

                      <div
                        style={{
                          border: prodForm.img
                            ? "1px solid rgba(0, 255, 136, 0.4)"
                            : "2px dashed rgba(0, 229, 255, 0.35)",
                          borderRadius: 10,
                          padding: "16px 20px",
                          background: prodForm.img
                            ? "rgba(0, 255, 136, 0.03)"
                            : "rgba(8, 12, 16, 0.6)",
                          display: "flex",
                          alignItems: "center",
                          gap: "20px",
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Khung xem trước ảnh */}
                        <div
                          style={{
                            width: 76,
                            height: 76,
                            borderRadius: 8,
                            background: "#080c10",
                            border: prodForm.img
                              ? "1px solid #00ff88"
                              : "1px dashed rgba(255,255,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          {prodForm.img ? (
                            <img
                              src={prodForm.img}
                              alt="Uploaded preview"
                              style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                          ) : (
                            <span style={{ fontSize: "1.8rem", color: "#7a8fa6" }}>📷</span>
                          )}
                        </div>

                        {/* Nút bấm tải ảnh & Thông tin chi tiết */}
                        <div style={{ flex: 1, minWidth: "220px" }}>
                          <input
                            type="file"
                            id="product-image-upload"
                            accept="image/png, image/jpeg, image/webp"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageFileChange(file, (base64, info) => {
                                  setProdForm((prev) => ({ ...prev, img: base64 }));
                                  setUploadedFileInfo(info);
                                });
                              }
                            }}
                          />

                          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                            <label
                              htmlFor="product-image-upload"
                              style={{
                                background: prodForm.img ? "rgba(0, 229, 255, 0.15)" : "#00e5ff",
                                color: prodForm.img ? "#00e5ff" : "#080c10",
                                border: prodForm.img ? "1px solid #00e5ff" : "none",
                                fontWeight: 700,
                                fontSize: "0.82rem",
                                padding: "8px 16px",
                                borderRadius: 6,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              📁 {prodForm.img ? "Đổi ảnh khác từ máy" : "Chọn ảnh từ máy tính"}
                            </label>

                            {prodForm.img && (
                              <button
                                type="button"
                                onClick={() => {
                                  setProdForm((prev) => ({ ...prev, img: "" }));
                                  setUploadedFileInfo(null);
                                }}
                                style={{
                                  background: "transparent",
                                  border: "1px solid rgba(255, 75, 75, 0.3)",
                                  color: "#ff7675",
                                  fontSize: "0.78rem",
                                  padding: "7px 12px",
                                  borderRadius: 6,
                                  cursor: "pointer",
                                }}
                              >
                                ✕ Gỡ ảnh
                              </button>
                            )}
                          </div>

                          <div style={{ marginTop: 8, fontSize: "0.76rem" }}>
                            {prodForm.img ? (
                              <span style={{ color: "#00ff88", fontWeight: 600 }}>
                                ✓ Đã chọn: {uploadedFileInfo?.name || "Ảnh hợp lệ"} ({uploadedFileInfo?.dimensions || ""} · {uploadedFileInfo?.sizeKb} KB) — Sẵn sàng lưu vào MongoDB Atlas!
                              </span>
                            ) : (
                              <span style={{ color: "#7a8fa6" }}>
                                Hỗ trợ file ảnh JPG, PNG, WEBP từ máy tính.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ gridColumn: "1 / -1", width: "100%", boxSizing: "border-box" }}>
                      <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 6 }}>
                        Thông số kỹ thuật (Specs tóm tắt)
                      </label>
                      <input
                        type="text"
                        placeholder="vd: Dual Core 240MHz, 4MB Flash, OV2640 Camera"
                        value={prodForm.specs}
                        onChange={(e) => setProdForm({ ...prodForm, specs: e.target.value })}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "9px 12px",
                          background: "#080c10",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: 6,
                          color: "#fff",
                          fontFamily: "inherit",
                          fontSize: "0.82rem",
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
                      <button
                        type="submit"
                        disabled={formBusy}
                        style={{
                          background: "#00e5ff",
                          border: "none",
                          color: "#080c10",
                          fontWeight: 700,
                          fontSize: "0.84rem",
                          padding: "10px 26px",
                          borderRadius: 6,
                          cursor: "pointer",
                          boxShadow: "0 0 12px rgba(0, 229, 255, 0.3)",
                        }}
                      >
                        {formBusy ? "Đang lưu vào Database..." : "+ Lưu linh kiện mới"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Danh Sách Sản Phẩm (Bảng cách đều các cột) */}
                <div
                  style={{
                    background: "#0d141e",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.82rem",
                      tableLayout: "fixed",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "rgba(0,0,0,0.4)",
                          color: "#7a8fa6",
                          borderBottom: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <th style={{ width: "26%", padding: "14px 18px", textAlign: "left" }}>
                          TÊN SẢN PHẨM
                        </th>
                        <th style={{ width: "20%", padding: "14px 18px", textAlign: "left" }}>
                          DANH MỤC
                        </th>
                        <th style={{ width: "20%", padding: "14px 18px", textAlign: "left" }}>
                          GIÁ BÁN
                        </th>
                        <th style={{ width: "18%", padding: "14px 18px", textAlign: "left" }}>
                          TỒN KHO
                        </th>
                        <th style={{ width: "16%", padding: "14px 18px", textAlign: "center" }}>
                          THAO TÁC
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {productList.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            style={{
                              padding: "40px",
                              textAlign: "center",
                              color: "#7a8fa6",
                            }}
                          >
                            Chưa có sản phẩm nào trong kho. Hãy thêm sản phẩm ở trên hoặc bấm &quot;Nạp lại dữ liệu mẫu&quot; ở tab Máy chủ!
                          </td>
                        </tr>
                      ) : (
                        productList.map((p) => {
                          const id = p._id || p.id;
                          const isOutOfStock = (p.stock ?? 0) <= 0;
                          const isHidden = Boolean(p.isDeleted) || isOutOfStock;
                          return (
                            <tr
                              key={id}
                              style={{
                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                                background: isHidden ? "rgba(255, 75, 75, 0.03)" : "transparent",
                                opacity: isHidden ? 0.75 : 1,
                              }}
                            >
                              {/* CỘT 1: TÊN SẢN PHẨM & HÌNH ẢNH */}
                              <td style={{ padding: "12px 18px", verticalAlign: "middle" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <img
                                    src={p.img || "/assets/products/Microcontrollers.png"}
                                    alt=""
                                    onError={(e) => {
                                      e.target.src = "/assets/products/Microcontrollers.png";
                                    }}
                                    style={{
                                      width: 42,
                                      height: 42,
                                      objectFit: "contain",
                                      borderRadius: 6,
                                      background: "#080c10",
                                      border: "1px solid rgba(255,255,255,0.1)",
                                      flexShrink: 0,
                                    }}
                                  />
                                  <div style={{ overflow: "hidden" }}>
                                    <div
                                      style={{
                                        fontWeight: 600,
                                        color: isHidden ? "#a0aec0" : "#fff",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {p.name}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "0.72rem",
                                        color: "#7a8fa6",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        marginTop: 2,
                                      }}
                                    >
                                      {p.specs || p.brand}
                                    </div>
                                    {isHidden && (
                                      <span
                                        style={{
                                          display: "inline-block",
                                          marginTop: 4,
                                          fontSize: "0.68rem",
                                          color: "#ff7675",
                                          background: "rgba(255, 118, 117, 0.15)",
                                          border: "1px solid rgba(255, 118, 117, 0.3)",
                                          padding: "1px 6px",
                                          borderRadius: 3,
                                          fontWeight: 700,
                                        }}
                                      >
                                        {isOutOfStock
                                          ? "[HẾT HÀNG - ĐÃ ẨN KHỎI CỬA HÀNG]"
                                          : "[ĐÃ ẨN KHỎI CỬA HÀNG]"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* CỘT 2: DANH MỤC */}
                              <td style={{ padding: "12px 18px", verticalAlign: "middle" }}>
                                <span
                                  style={{
                                    color: "#00e5ff",
                                    background: "rgba(0, 229, 255, 0.08)",
                                    padding: "3px 8px",
                                    borderRadius: 4,
                                    fontSize: "0.76rem",
                                  }}
                                >
                                  {CATEGORY_MAP[p.categoryKey || p.category] ||
                                    p.categoryKey ||
                                    p.category ||
                                    "Khác"}
                                </span>
                              </td>

                              {/* CỘT 3: GIÁ BÁN */}
                              <td
                                style={{
                                  padding: "12px 18px",
                                  verticalAlign: "middle",
                                  color: "#00ff88",
                                  fontWeight: 700,
                                }}
                              >
                                {Number(p.price || 0).toLocaleString("vi-VN")} đ
                              </td>

                              {/* CỘT 4: TỒN KHO */}
                              <td style={{ padding: "12px 18px", verticalAlign: "middle" }}>
                                <span
                                  style={{
                                    color: (p.stock ?? 0) > 0 ? "#00ff88" : "#ff4b4b",
                                    fontWeight: 700,
                                    background:
                                      (p.stock ?? 0) > 0
                                        ? "rgba(0, 255, 136, 0.08)"
                                        : "rgba(255, 75, 75, 0.12)",
                                    padding: "3px 8px",
                                    borderRadius: 4,
                                  }}
                                >
                                  {p.stock ?? 0} cái
                                </span>
                                {isOutOfStock && (
                                  <div
                                    style={{
                                      fontSize: "0.68rem",
                                      color: "#ff7675",
                                      marginTop: 4,
                                      fontWeight: 700,
                                    }}
                                  >
                                    Đã ẩn khỏi Shop
                                  </div>
                                )}
                              </td>

                              {/* CỘT 5: THAO TÁC (NÚT XANH) */}
                              <td
                                style={{
                                  padding: "12px 18px",
                                  verticalAlign: "middle",
                                  textAlign: "center",
                                }}
                              >
                                <button
                                  onClick={() => handleOpenEdit(p)}
                                  style={{
                                    background: "#00ff88",
                                    color: "#080c10",
                                    fontWeight: 700,
                                    border: "none",
                                    borderRadius: 6,
                                    padding: "7px 16px",
                                    fontSize: "0.78rem",
                                    cursor: "pointer",
                                    boxShadow: "0 0 10px rgba(0, 255, 136, 0.25)",
                                    transition: "all 0.15s",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.boxShadow =
                                      "0 0 16px rgba(0, 255, 136, 0.5)";
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.boxShadow =
                                      "0 0 10px rgba(0, 255, 136, 0.25)";
                                  }}
                                >
                                  ⚙️ Sửa / Quản lý
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODAL SỬA SẢN PHẨM & ẨN KHỎI CỬA HÀNG (POPUP KHUNG) */}
            {editingProduct && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0, 0, 0, 0.8)",
                  backdropFilter: "blur(6px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 999,
                  padding: "20px",
                }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setEditingProduct(null);
                }}
              >
                <div
                  style={{
                    background: "#0d141e",
                    border: "1px solid #00ff88",
                    borderRadius: "14px",
                    width: "100%",
                    maxWidth: "580px",
                    padding: "26px",
                    boxShadow: "0 10px 40px rgba(0, 255, 136, 0.2)",
                    maxHeight: "90vh",
                    overflowY: "auto",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <h3 style={{ fontSize: "1.05rem", color: "#00ff88", margin: 0 }}>
                      ⚙️ Chỉnh sửa thông tin linh kiện
                    </h3>
                    <button
                      onClick={() => setEditingProduct(null)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#7a8fa6",
                        fontSize: "1.2rem",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Trạng thái hiển thị */}
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      marginBottom: "18px",
                      fontSize: "0.78rem",
                      background:
                        editingProduct.isDeleted || Number(editForm.stock) === 0
                          ? "rgba(255, 75, 75, 0.15)"
                          : "rgba(0, 255, 136, 0.1)",
                      border:
                        editingProduct.isDeleted || Number(editForm.stock) === 0
                          ? "1px solid rgba(255, 75, 75, 0.3)"
                          : "1px solid rgba(0, 255, 136, 0.3)",
                      color:
                        editingProduct.isDeleted || Number(editForm.stock) === 0
                          ? "#ff7675"
                          : "#00ff88",
                    }}
                  >
                    {Number(editForm.stock) === 0
                      ? "⚠️ Tồn kho = 0: Sản phẩm sẽ tự động bị ẨN khỏi cửa hàng (Khách không thấy, Admin vẫn thấy)"
                      : editingProduct.isDeleted
                      ? "⚠️ Linh kiện này đang bị ẨN khỏi cửa hàng (Khách không thấy, Admin vẫn thấy)"
                      : "✅ Linh kiện đang HIỂN THỊ công khai trên cửa hàng"}
                  </div>

                  <form onSubmit={handleSaveEdit} style={{ display: "grid", gap: "14px" }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 4 }}>
                        Tên sản phẩm *
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        required
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "9px 12px",
                          background: "#080c10",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: 6,
                          color: "#fff",
                          fontFamily: "inherit",
                          fontSize: "0.82rem",
                        }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 4 }}>
                          Danh mục *
                        </label>
                        <select
                          value={editForm.categoryKey}
                          onChange={(e) =>
                            setEditForm({ ...editForm, categoryKey: e.target.value })
                          }
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "9px 12px",
                            background: "#080c10",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 6,
                            color: "#fff",
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                          }}
                        >
                          <option value="iot">IoT & Wireless</option>
                          <option value="robotics">Robotics</option>
                          <option value="displays">Displays</option>
                          <option value="tools">Tools</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 4 }}>
                          Số lượng tồn kho
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.stock}
                          onKeyDown={(e) => {
                            if (e.key === "-" || e.key === "e") e.preventDefault();
                          }}
                          onChange={(e) => {
                            const val = e.target.value === "" ? "" : Math.max(0, Number(e.target.value));
                            setEditForm({ ...editForm, stock: val });
                          }}
                          required
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "9px 12px",
                            background: "#080c10",
                            border:
                              Number(editForm.stock) === 0
                                ? "1px solid #ff7675"
                                : "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 6,
                            color: Number(editForm.stock) === 0 ? "#ff7675" : "#fff",
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                          }}
                        />
                        {Number(editForm.stock) === 0 && (
                          <div style={{ fontSize: "0.7rem", color: "#ff7675", marginTop: 4 }}>
                            ⚠️ Tồn kho = 0: Sản phẩm sẽ bị ẩn khỏi cửa hàng
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 4 }}>
                          Giá bán (VNĐ)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.price}
                          onKeyDown={(e) => {
                            if (e.key === "-" || e.key === "e") e.preventDefault();
                          }}
                          onChange={(e) => {
                            const val = e.target.value === "" ? "" : Math.max(0, Number(e.target.value));
                            setEditForm({ ...editForm, price: val });
                          }}
                          required
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "9px 12px",
                            background: "#080c10",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 6,
                            color: "#00ff88",
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 4 }}>
                          Giá cũ (nếu có giảm giá)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.oldPrice}
                          onKeyDown={(e) => {
                            if (e.key === "-" || e.key === "e") e.preventDefault();
                          }}
                          onChange={(e) => {
                            const val = e.target.value === "" ? "" : Math.max(0, Number(e.target.value));
                            setEditForm({ ...editForm, oldPrice: val });
                          }}
                          placeholder="Bỏ trống nếu không có"
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "9px 12px",
                            background: "#080c10",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 6,
                            color: "#7a8fa6",
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                          }}
                        />
                      </div>
                    </div>

                    {/* HÌNH ẢNH SẢN PHẨM TRONG MODAL (UPLOAD TỪ MÁY) */}
                    <div>
                      <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 6 }}>
                        Hình ảnh sản phẩm (Lưu trên Database)
                      </label>
                      <div
                        style={{
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 10,
                          padding: "14px 16px",
                          background: "rgba(8, 12, 16, 0.5)",
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: 8,
                            background: "#080c10",
                            border: "1px solid rgba(0, 229, 255, 0.4)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={editForm.img || "/assets/products/Microcontrollers.png"}
                            alt=""
                            onError={(e) => {
                              e.target.src = "/assets/products/Microcontrollers.png";
                            }}
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                        </div>

                        <div style={{ flex: 1, minWidth: "200px" }}>
                          <input
                            type="file"
                            id="modal-image-upload"
                            accept="image/png, image/jpeg, image/webp"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageFileChange(file, (base64, info) => {
                                  setEditForm((prev) => ({ ...prev, img: base64 }));
                                  setEditUploadedFileInfo(info);
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor="modal-image-upload"
                            style={{
                              background: "rgba(0, 229, 255, 0.15)",
                              color: "#00e5ff",
                              border: "1px solid #00e5ff",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                              padding: "7px 14px",
                              borderRadius: 6,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            📁 Chọn ảnh mới từ máy tính
                          </label>

                          <div style={{ marginTop: 6, fontSize: "0.74rem" }}>
                            {editUploadedFileInfo ? (
                              <span style={{ color: "#00ff88" }}>
                                ✓ Đã chọn ảnh mới: {editUploadedFileInfo.name} ({editUploadedFileInfo.sizeKb} KB)
                              </span>
                            ) : (
                              <span style={{ color: "#7a8fa6" }}>
                                Bấm nút trên để tải ảnh từ máy tính thay thế ảnh hiện tại
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 4 }}>
                        Thông số kỹ thuật (Specs)
                      </label>
                      <input
                        type="text"
                        value={editForm.specs}
                        onChange={(e) => setEditForm({ ...editForm, specs: e.target.value })}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "9px 12px",
                          background: "#080c10",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: 6,
                          color: "#fff",
                          fontFamily: "inherit",
                          fontSize: "0.82rem",
                        }}
                      />
                    </div>

                    {/* Các nút bấm thao tác trong Modal */}
                    <div
                      style={{
                        marginTop: "12px",
                        paddingTop: "16px",
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      {/* Nút Ẩn / Xóa mềm (Trang quản lý vẫn thấy) */}
                      <button
                        type="button"
                        onClick={handleToggleHideProduct}
                        style={{
                          background: editingProduct.isDeleted
                            ? "rgba(0, 255, 136, 0.15)"
                            : "rgba(255, 75, 75, 0.15)",
                          border: editingProduct.isDeleted
                            ? "1px solid #00ff88"
                            : "1px solid #ff4b4b",
                          color: editingProduct.isDeleted ? "#00ff88" : "#ff4b4b",
                          padding: "8px 14px",
                          borderRadius: 6,
                          fontFamily: "inherit",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {editingProduct.isDeleted
                          ? "👁️‍🗨️ Bỏ ẩn / Hiện lại trên Shop"
                          : "🗑️ Xóa / Ẩn khỏi cửa hàng"}
                      </button>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          style={{
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.2)",
                            color: "#7a8fa6",
                            padding: "8px 16px",
                            borderRadius: 6,
                            fontFamily: "inherit",
                            fontSize: "0.78rem",
                            cursor: "pointer",
                          }}
                        >
                          Đóng
                        </button>
                        <button
                          type="submit"
                          disabled={editBusy}
                          style={{
                            background: "#00ff88",
                            border: "none",
                            color: "#080c10",
                            fontWeight: 800,
                            padding: "8px 20px",
                            borderRadius: 6,
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            boxShadow: "0 0 12px rgba(0, 255, 136, 0.4)",
                          }}
                        >
                          {editBusy ? "Đang lưu..." : "💾 Lưu thay đổi"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB: QUẢN LÝ BÀI VIẾT BLOG */}
            {activeTab === "articles" && (
              <div style={{ display: "grid", gap: "24px" }}>
                {/* Form Soạn Thảo Bài Viết Mới */}
                <div
                  style={{
                    background: "#0d141e",
                    border: "1px solid rgba(0, 229, 255, 0.2)",
                    borderRadius: "12px",
                    padding: "24px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1rem",
                      color: "#00e5ff",
                      marginBottom: "18px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    ✍️ Soạn thảo bài viết mới lên Blog
                  </h3>
                  <form
                    onSubmit={handleCreateArticle}
                    style={{
                      display: "grid",
                      gap: "16px",
                    }}
                  >
                    {/* 4 CỘT CÁCH ĐỀU NHAU 100%: Tiêu đề, Chuyên mục, Tác giả, Thời gian đọc */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                        gap: "16px",
                        width: "100%",
                      }}
                    >
                      <div style={{ width: "100%" }}>
                        <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 6 }}>
                          Tiêu đề bài viết *
                        </label>
                        <input
                          type="text"
                          placeholder="vd: Hướng dẫn lập trình ESP32 với Arduino IDE"
                          value={articleForm.title}
                          onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                          required
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "9px 12px",
                            background: "#080c10",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 6,
                            color: "#fff",
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                          }}
                        />
                      </div>

                      <div style={{ width: "100%" }}>
                        <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 6 }}>
                          Chuyên mục *
                        </label>
                        <select
                          value={articleForm.category}
                          onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "9px 12px",
                            background: "#080c10",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 6,
                            color: "#fff",
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                          }}
                        >
                          {BLOG_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ width: "100%" }}>
                        <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 6 }}>
                          Tên tác giả *
                        </label>
                        <input
                          type="text"
                          placeholder="vd: VoltCore Dev Team"
                          value={articleForm.authorName}
                          onChange={(e) => setArticleForm({ ...articleForm, authorName: e.target.value })}
                          required
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "9px 12px",
                            background: "#080c10",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 6,
                            color: "#00e5ff",
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                          }}
                        />
                      </div>

                      <div style={{ width: "100%" }}>
                        <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 6 }}>
                          Thời gian đọc (phút) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="5"
                          value={articleForm.minutes}
                          onChange={(e) => setArticleForm({ ...articleForm, minutes: e.target.value })}
                          required
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "9px 12px",
                            background: "#080c10",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 6,
                            color: "#fff",
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                          }}
                        />
                      </div>
                    </div>

                    {/* TẢI ẢNH BÌA BÀI VIẾT TỪ MÁY TÍNH */}
                    <div>
                      <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 6 }}>
                        Ảnh bìa bài viết (Cover Image) * (Tải ảnh từ máy tính hoặc dán URL)
                      </label>
                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          alignItems: "center",
                          flexWrap: "wrap",
                          background: "#080c10",
                          border: "1px solid rgba(255,255,255,0.1)",
                          padding: "12px",
                          borderRadius: 8,
                        }}
                      >
                        {/* Khung xem trước ảnh */}
                        <div
                          style={{
                            width: 100,
                            height: 65,
                            borderRadius: 6,
                            background: "#141f2d",
                            border: "1px dashed rgba(0, 229, 255, 0.4)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          {articleForm.img ? (
                            <img
                              src={articleForm.img}
                              alt="Article cover preview"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <span style={{ fontSize: "1.8rem", color: "#7a8fa6" }}>📰</span>
                          )}
                        </div>

                        {/* Nút bấm tải ảnh */}
                        <div style={{ flex: 1, minWidth: "220px" }}>
                          <input
                            type="file"
                            id="article-image-upload"
                            accept="image/png, image/jpeg, image/webp"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageFileChange(file, (base64, info) => {
                                  setArticleForm((prev) => ({ ...prev, img: base64 }));
                                  setArticleUploadedFileInfo(info);
                                });
                              }
                            }}
                          />

                          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                            <label
                              htmlFor="article-image-upload"
                              style={{
                                background: articleForm.img ? "rgba(0, 229, 255, 0.15)" : "#00e5ff",
                                color: articleForm.img ? "#00e5ff" : "#080c10",
                                border: articleForm.img ? "1px solid #00e5ff" : "none",
                                fontWeight: 700,
                                fontSize: "0.82rem",
                                padding: "8px 16px",
                                borderRadius: 6,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              📁 {articleForm.img ? "Đổi ảnh bìa từ máy" : "Chọn ảnh bìa từ máy tính"}
                            </label>

                            {articleForm.img && (
                              <button
                                type="button"
                                onClick={() => {
                                  setArticleForm((prev) => ({ ...prev, img: "" }));
                                  setArticleUploadedFileInfo(null);
                                }}
                                style={{
                                  background: "transparent",
                                  border: "1px solid rgba(255, 75, 75, 0.3)",
                                  color: "#ff4b4b",
                                  padding: "6px 12px",
                                  borderRadius: 6,
                                  fontSize: "0.75rem",
                                  cursor: "pointer",
                                }}
                              >
                                Gỡ ảnh
                              </button>
                            )}
                          </div>

                          {articleUploadedFileInfo && (
                            <div style={{ marginTop: 6, fontSize: "0.72rem", color: "#00ff88" }}>
                              ✓ Đã nén &amp; lưu Base64: {articleUploadedFileInfo.name} ({articleUploadedFileInfo.dimensions}, ~{articleUploadedFileInfo.sizeKb} KB)
                            </div>
                          )}
                        </div>

                        {/* Dán URL trực tiếp (tùy chọn) */}
                        <div style={{ flex: 1.5, minWidth: "260px" }}>
                          <input
                            type="text"
                            placeholder="Hoặc dán URL / đường dẫn ảnh có sẵn (/assets/img/...)"
                            value={articleForm.img}
                            onChange={(e) => {
                              setArticleForm({ ...articleForm, img: e.target.value });
                              setArticleUploadedFileInfo(null);
                            }}
                            style={{
                              width: "100%",
                              boxSizing: "border-box",
                              padding: "9px 12px",
                              background: "#080c10",
                              border: "1px solid rgba(255,255,255,0.15)",
                              borderRadius: 6,
                              color: "#fff",
                              fontFamily: "inherit",
                              fontSize: "0.78rem",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* TÓM TẮT BÀI VIẾT (EXCERPT) */}
                    <div>
                      <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 6 }}>
                        Tóm tắt ngắn (Excerpt) hiển thị ngoài danh sách bài viết
                      </label>
                      <textarea
                        rows={2}
                        placeholder="vd: Hướng dẫn chi tiết từng bước kết nối ESP32 với cảm biến nhiệt độ DHT11 và gửi dữ liệu lên máy chủ..."
                        value={articleForm.excerpt}
                        onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "9px 12px",
                          background: "#080c10",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: 6,
                          color: "#fff",
                          fontFamily: "inherit",
                          fontSize: "0.82rem",
                          resize: "vertical",
                        }}
                      />
                    </div>

                    {/* NỘI DUNG CHI TIẾT BÀI VIẾT (TRÌNH DỰNG KHỐI TRỰC QUAN) */}
                    <div>
                      <label style={{ fontSize: "0.78rem", color: "#00e5ff", display: "flex", alignItems: "center", gap: "6px", marginBottom: 8, fontWeight: 700 }}>
                        <span>⚡</span> Nội dung chi tiết bài viết (Nhập nội dung bên trái, chọn tính năng nút bên phải):
                      </label>
                      <ArticleContentBuilder
                        key="create-article-builder"
                        value={articleForm.contentHtml}
                        onChange={(newHtml) => setArticleForm((prev) => ({ ...prev, contentHtml: newHtml }))}
                      />
                    </div>

                    {/* TAGS & FEATURED CHECKBOX & SUBMIT BUTTON */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "14px",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: "250px" }}>
                        <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 4 }}>
                          Tags (phân cách bằng dấu phẩy)
                        </label>
                        <input
                          type="text"
                          placeholder="vd: Arduino, ESP32, IoT, Lập trình"
                          value={articleForm.tags}
                          onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })}
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "8px 12px",
                            background: "#080c10",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 6,
                            color: "#fff",
                            fontFamily: "inherit",
                            fontSize: "0.8rem",
                          }}
                        />
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "18px" }}>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "0.8rem",
                            color: "#00e5ff",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={articleForm.featured}
                            onChange={(e) => setArticleForm({ ...articleForm, featured: e.target.checked })}
                            style={{ width: 16, height: 16, accentColor: "#00e5ff", cursor: "pointer" }}
                          />
                          ⭐ Đặt làm bài viết Nổi bật (Featured)
                        </label>

                        <button
                          type="submit"
                          disabled={articleFormBusy}
                          style={{
                            background: "#00e5ff",
                            border: "none",
                            color: "#080c10",
                            fontWeight: 800,
                            padding: "9px 24px",
                            borderRadius: 6,
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            boxShadow: "0 0 14px rgba(0, 229, 255, 0.4)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {articleFormBusy ? "Đang xuất bản..." : "+ Đăng bài viết lên Blog"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Danh Sách Bài Viết Blog */}
                <div
                  style={{
                    background: "#0d141e",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      background: "rgba(0, 0, 0, 0.2)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#00e5ff" }}>
                      📰 Danh sách bài viết Blog trên hệ thống ({articleList.length} bài)
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#7a8fa6" }}>
                      * Lưu ý: Nút màu xanh mở khung sửa thông tin &amp; ẩn bài viết khỏi Blog
                    </div>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.8rem",
                        tableLayout: "fixed",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            background: "rgba(0,0,0,0.4)",
                            color: "#7a8fa6",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <th style={{ width: "32%", padding: "14px 18px", textAlign: "left" }}>
                            BÀI VIẾT &amp; ẢNH BÌA
                          </th>
                          <th style={{ width: "16%", padding: "14px 18px", textAlign: "left" }}>
                            CHUYÊN MỤC
                          </th>
                          <th style={{ width: "20%", padding: "14px 18px", textAlign: "left" }}>
                            TÁC GIẢ &amp; NGÀY ĐĂNG
                          </th>
                          <th style={{ width: "14%", padding: "14px 18px", textAlign: "left" }}>
                            LƯỢT ĐỌC
                          </th>
                          <th style={{ width: "18%", padding: "14px 18px", textAlign: "center" }}>
                            THAO TÁC
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {articleList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              style={{
                                padding: "40px",
                                textAlign: "center",
                                color: "#7a8fa6",
                              }}
                            >
                              Chưa có bài viết nào trên Blog. Hãy soạn thảo và đăng bài mới ở trên!
                            </td>
                          </tr>
                        ) : (
                          articleList.map((art) => {
                            const id = art._id || art.id;
                            const isHidden = Boolean(art.isDeleted);
                            return (
                              <tr
                                key={id}
                                style={{
                                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                                  background: isHidden ? "rgba(255, 75, 75, 0.03)" : "transparent",
                                  opacity: isHidden ? 0.75 : 1,
                                }}
                              >
                                {/* CỘT 1: BÀI VIẾT & ẢNH BÌA */}
                                <td style={{ padding: "12px 18px", verticalAlign: "middle" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <img
                                      src={art.img || "/assets/img/esp32 getting started.png"}
                                      alt=""
                                      onError={(e) => {
                                        e.target.src = "/assets/img/esp32 getting started.png";
                                      }}
                                      style={{
                                        width: 54,
                                        height: 38,
                                        objectFit: "cover",
                                        borderRadius: 6,
                                        background: "#080c10",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        flexShrink: 0,
                                      }}
                                    />
                                    <div style={{ overflow: "hidden" }}>
                                      <div
                                        style={{
                                          fontWeight: 600,
                                          color: isHidden ? "#a0aec0" : "#fff",
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                        }}
                                      >
                                        {art.featured && <span style={{ color: "#f59e0b", marginRight: 4 }}>⭐</span>}
                                        {art.title}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: "0.72rem",
                                          color: "#7a8fa6",
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          marginTop: 2,
                                        }}
                                      >
                                        {art.excerpt || art.slug}
                                      </div>
                                      {isHidden && (
                                        <span
                                          style={{
                                            display: "inline-block",
                                            marginTop: 4,
                                            fontSize: "0.68rem",
                                            background: "rgba(255, 75, 75, 0.2)",
                                            color: "#ff7675",
                                            padding: "1px 6px",
                                            borderRadius: 4,
                                            border: "1px solid rgba(255, 75, 75, 0.4)",
                                            fontWeight: 600,
                                          }}
                                        >
                                          [ĐÃ ẨN KHỎI BLOG]
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* CỘT 2: CHUYÊN MỤC */}
                                <td style={{ padding: "12px 18px", verticalAlign: "middle" }}>
                                  <span
                                    style={{
                                      background: "rgba(0, 229, 255, 0.1)",
                                      border: "1px solid rgba(0, 229, 255, 0.3)",
                                      color: "#00e5ff",
                                      padding: "3px 8px",
                                      borderRadius: 4,
                                      fontSize: "0.74rem",
                                    }}
                                  >
                                    {art.category || "Tutorials"}
                                  </span>
                                </td>

                                {/* CỘT 3: TÁC GIẢ & NGÀY ĐĂNG */}
                                <td style={{ padding: "12px 18px", verticalAlign: "middle" }}>
                                  <div style={{ color: "#e8edf2", fontWeight: 600 }}>{art.authorName || "VoltCore Dev"}</div>
                                  <div style={{ fontSize: "0.72rem", color: "#7a8fa6", marginTop: 2 }}>
                                    {art.published || "Vừa xong"} • {art.minutes || 5} phút đọc
                                  </div>
                                </td>

                                {/* CỘT 4: LƯỢT ĐỌC */}
                                <td style={{ padding: "12px 18px", verticalAlign: "middle" }}>
                                  <span style={{ color: "#00ff88", fontWeight: 700 }}>
                                    {(art.reads ?? 0).toLocaleString()}
                                  </span>{" "}
                                  <span style={{ fontSize: "0.72rem", color: "#7a8fa6" }}>lượt xem</span>
                                </td>

                                {/* CỘT 5: THAO TÁC */}
                                <td style={{ padding: "12px 18px", textAlign: "center", verticalAlign: "middle" }}>
                                  <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                                    <button
                                      onClick={() => handleOpenEditArticle(art)}
                                      style={{
                                        background: "rgba(0, 255, 136, 0.15)",
                                        border: "1px solid #00ff88",
                                        color: "#00ff88",
                                        padding: "6px 12px",
                                        borderRadius: 6,
                                        fontFamily: "inherit",
                                        fontSize: "0.76rem",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        boxShadow: "0 0 10px rgba(0, 255, 136, 0.25)",
                                        transition: "all 0.15s ease",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      ⚙️ Sửa / Quản lý
                                    </button>

                                    <Link
                                      to={`/blog/${art.slug}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        background: "rgba(0, 229, 255, 0.1)",
                                        border: "1px solid rgba(0, 229, 255, 0.3)",
                                        color: "#00e5ff",
                                        padding: "6px 10px",
                                        borderRadius: 6,
                                        fontFamily: "inherit",
                                        fontSize: "0.76rem",
                                        textDecoration: "none",
                                        fontWeight: 600,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      🌐 Xem
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL SỬA BÀI VIẾT BLOG & ẨN KHỎI BLOG */}
            {editingArticle && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0, 0, 0, 0.8)",
                  backdropFilter: "blur(6px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 999,
                  padding: "20px",
                }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setEditingArticle(null);
                }}
              >
                <div
                  style={{
                    background: "#0d141e",
                    border: "1px solid #00ff88",
                    borderRadius: "14px",
                    width: "95vw",
                    maxWidth: "1350px",
                    padding: "26px 30px",
                    boxShadow: "0 10px 40px rgba(0, 255, 136, 0.2)",
                    maxHeight: "92vh",
                    overflowY: "auto",
                    overflowX: "hidden",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <h3 style={{ fontSize: "1.1rem", color: "#00ff88", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                      ⚙️ Chỉnh sửa thông tin bài viết Blog
                    </h3>
                    <button
                      onClick={() => setEditingArticle(null)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#7a8fa6",
                        fontSize: "1.3rem",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Trạng thái hiển thị */}
                  <div
                    style={{
                      padding: "8px 14px",
                      borderRadius: 6,
                      marginBottom: "18px",
                      fontSize: "0.8rem",
                      background: editingArticle.isDeleted ? "rgba(255, 75, 75, 0.15)" : "rgba(0, 255, 136, 0.1)",
                      border: editingArticle.isDeleted
                        ? "1px solid rgba(255, 75, 75, 0.3)"
                        : "1px solid rgba(0, 255, 136, 0.3)",
                      color: editingArticle.isDeleted ? "#ff7675" : "#00ff88",
                      fontWeight: 600,
                    }}
                  >
                    {editingArticle.isDeleted
                      ? "🔴 Trạng thái: Đang bị ẨN khỏi trang Blog công khai (Chỉ Admin thấy)"
                      : "🟢 Trạng thái: Đang HIỂN THỊ công khai trên trang Blog"}
                  </div>

                  <form onSubmit={handleSaveEditArticle} style={{ display: "grid", gap: "16px" }}>
                    {/* 4 CỘT CÁCH ĐỀU NHAU: Tiêu đề, Chuyên mục, Tác giả, Thời gian đọc */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                        gap: "16px",
                        width: "100%",
                      }}
                    >
                      <div style={{ width: "100%", minWidth: 0 }}>
                        <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 6 }}>
                          Tiêu đề bài viết *
                        </label>
                        <input
                          type="text"
                          value={editArticleForm.title}
                          onChange={(e) => setEditArticleForm({ ...editArticleForm, title: e.target.value })}
                          required
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "9px 12px",
                            background: "#080c10",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 6,
                            color: "#fff",
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                          }}
                        />
                      </div>

                      <div style={{ width: "100%", minWidth: 0 }}>
                        <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 6 }}>
                          Chuyên mục *
                        </label>
                        <select
                          value={editArticleForm.category}
                          onChange={(e) => setEditArticleForm({ ...editArticleForm, category: e.target.value })}
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "9px 12px",
                            background: "#080c10",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 6,
                            color: "#fff",
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                          }}
                        >
                          {BLOG_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ width: "100%", minWidth: 0 }}>
                        <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 6 }}>
                          Tác giả *
                        </label>
                        <input
                          type="text"
                          value={editArticleForm.authorName}
                          onChange={(e) => setEditArticleForm({ ...editArticleForm, authorName: e.target.value })}
                          required
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "9px 12px",
                            background: "#080c10",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 6,
                            color: "#00e5ff",
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                          }}
                        />
                      </div>

                      <div style={{ width: "100%", minWidth: 0 }}>
                        <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 6 }}>
                          Thời gian đọc (phút) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={editArticleForm.minutes}
                          onChange={(e) => setEditArticleForm({ ...editArticleForm, minutes: e.target.value })}
                          required
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "9px 12px",
                            background: "#080c10",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 6,
                            color: "#fff",
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                          }}
                        />
                      </div>
                    </div>

                    {/* HÀNG 2: ẢNH BÌA & TÓM TẮT NGẮN CẠNH NHAU */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.2fr 1fr",
                        gap: "16px",
                        width: "100%",
                      }}
                    >
                      {/* Thay đổi ảnh bìa */}
                      <div style={{ minWidth: 0 }}>
                        <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 6 }}>
                          Ảnh bìa bài viết (Tải ảnh từ máy tính hoặc dán URL)
                        </label>
                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            alignItems: "center",
                            background: "#080c10",
                            border: "1px solid rgba(255,255,255,0.1)",
                            padding: "10px",
                            borderRadius: 6,
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              width: 75,
                              height: 52,
                              borderRadius: 4,
                              background: "#141f2d",
                              border: "1px dashed rgba(0, 229, 255, 0.4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                              flexShrink: 0,
                            }}
                          >
                            {editArticleForm.img ? (
                              <img
                                src={editArticleForm.img}
                                alt="Edit preview"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <span style={{ fontSize: "1.2rem", color: "#7a8fa6" }}>📰</span>
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <input
                              type="file"
                              id="edit-article-image-upload"
                              accept="image/png, image/jpeg, image/webp"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleImageFileChange(file, (base64, info) => {
                                    setEditArticleForm((prev) => ({ ...prev, img: base64 }));
                                    setEditArticleUploadedFileInfo(info);
                                  });
                                }
                              }}
                            />
                            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                              <label
                                htmlFor="edit-article-image-upload"
                                style={{
                                  background: "#00e5ff",
                                  color: "#080c10",
                                  fontWeight: 700,
                                  fontSize: "0.76rem",
                                  padding: "6px 12px",
                                  borderRadius: 4,
                                  cursor: "pointer",
                                  display: "inline-block",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                📁 Tải ảnh mới từ máy tính
                              </label>

                              {editArticleForm.img && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditArticleForm((prev) => ({ ...prev, img: "" }));
                                    setEditArticleUploadedFileInfo(null);
                                  }}
                                  style={{
                                    background: "transparent",
                                    border: "1px solid rgba(255, 75, 75, 0.3)",
                                    color: "#ff4b4b",
                                    padding: "5px 10px",
                                    borderRadius: 4,
                                    fontSize: "0.72rem",
                                    cursor: "pointer",
                                  }}
                                >
                                  Gỡ ảnh
                                </button>
                              )}
                            </div>

                            {editArticleUploadedFileInfo && (
                              <div style={{ marginTop: 4, fontSize: "0.7rem", color: "#00ff88" }}>
                                ✓ Đã nén &amp; chọn: {editArticleUploadedFileInfo.name} (~{editArticleUploadedFileInfo.sizeKb} KB)
                              </div>
                            )}

                            <input
                              type="text"
                              placeholder="Hoặc dán URL ảnh (/assets/...)"
                              value={editArticleForm.img || ""}
                              onChange={(e) => {
                                setEditArticleForm({ ...editArticleForm, img: e.target.value });
                                setEditArticleUploadedFileInfo(null);
                              }}
                              style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "6px 10px",
                                background: "#05080c",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 4,
                                color: "#fff",
                                fontFamily: "inherit",
                                fontSize: "0.74rem",
                                marginTop: "6px",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Tóm tắt ngắn */}
                      <div style={{ minWidth: 0 }}>
                        <label style={{ fontSize: "0.75rem", color: "#7a8fa6", display: "block", marginBottom: 6 }}>
                          Tóm tắt ngắn (Excerpt)
                        </label>
                        <textarea
                          rows={3}
                          value={editArticleForm.excerpt}
                          onChange={(e) => setEditArticleForm({ ...editArticleForm, excerpt: e.target.value })}
                          placeholder="Tóm tắt ngắn nội dung chính của bài viết..."
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "9px 12px",
                            background: "#080c10",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 6,
                            color: "#fff",
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                            resize: "vertical",
                            height: "92px",
                          }}
                        />
                      </div>
                    </div>

                    {/* Nội dung chi tiết (Trình dựng khối) */}
                    <div>
                      <label style={{ fontSize: "0.78rem", color: "#00e5ff", display: "flex", alignItems: "center", gap: "6px", marginBottom: 8, fontWeight: 700 }}>
                        <span>⚡</span> Nội dung chi tiết bài viết (Nhập nội dung bên trái, chọn tính năng nút bên phải):
                      </label>
                      <ArticleContentBuilder
                        key={editingArticle._id || editingArticle.id || "edit-builder"}
                        value={editArticleForm.contentHtml}
                        onChange={(newHtml) => setEditArticleForm((prev) => ({ ...prev, contentHtml: newHtml }))}
                      />
                    </div>

                    {/* Tags & Featured */}
                    <div style={{ display: "flex", gap: "14px", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <label style={{ fontSize: "0.74rem", color: "#7a8fa6", display: "block", marginBottom: 4 }}>
                          Tags (phân cách bằng dấu phẩy)
                        </label>
                        <input
                          type="text"
                          value={editArticleForm.tags}
                          onChange={(e) => setEditArticleForm({ ...editArticleForm, tags: e.target.value })}
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "8px 12px",
                            background: "#080c10",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 6,
                            color: "#fff",
                            fontFamily: "inherit",
                            fontSize: "0.8rem",
                          }}
                        />
                      </div>

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "0.8rem",
                          color: "#00e5ff",
                          cursor: "pointer",
                          marginTop: "16px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={editArticleForm.featured}
                          onChange={(e) => setEditArticleForm({ ...editArticleForm, featured: e.target.checked })}
                          style={{ width: 16, height: 16, accentColor: "#00e5ff", cursor: "pointer" }}
                        />
                        ⭐ Bài viết Nổi bật (Featured)
                      </label>
                    </div>

                    {/* Modal Buttons: Toggle Hide vs Save */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "16px",
                        paddingTop: "14px",
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={handleToggleHideArticle}
                          style={{
                            background: editingArticle.isDeleted ? "rgba(0, 255, 136, 0.15)" : "rgba(255, 75, 75, 0.15)",
                            border: editingArticle.isDeleted ? "1px solid #00ff88" : "1px solid #ff4b4b",
                            color: editingArticle.isDeleted ? "#00ff88" : "#ff4b4b",
                            padding: "8px 14px",
                            borderRadius: 6,
                            fontFamily: "inherit",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {editingArticle.isDeleted ? "👁️‍🗨️ Bỏ ẩn / Hiện lại trên Blog" : "🗑️ Xóa / Ẩn bài viết khỏi Blog"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(editingArticle._id || editingArticle.id, editingArticle.title)}
                          style={{
                            background: "transparent",
                            border: "1px solid rgba(255, 75, 75, 0.3)",
                            color: "#ff4b4b",
                            padding: "8px 12px",
                            borderRadius: 6,
                            fontFamily: "inherit",
                            fontSize: "0.76rem",
                            cursor: "pointer",
                          }}
                        >
                          Xóa vĩnh viễn
                        </button>
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          type="button"
                          onClick={() => setEditingArticle(null)}
                          style={{
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.2)",
                            color: "#7a8fa6",
                            padding: "8px 16px",
                            borderRadius: 6,
                            fontFamily: "inherit",
                            fontSize: "0.78rem",
                            cursor: "pointer",
                          }}
                        >
                          Đóng
                        </button>
                        <button
                          type="submit"
                          disabled={editArticleBusy}
                          style={{
                            background: "#00ff88",
                            border: "none",
                            color: "#080c10",
                            fontWeight: 800,
                            padding: "8px 20px",
                            borderRadius: 6,
                            fontFamily: "inherit",
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            boxShadow: "0 0 12px rgba(0, 255, 136, 0.4)",
                          }}
                        >
                          {editArticleBusy ? "Đang lưu..." : "💾 Lưu thay đổi"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB: TỔNG QUAN HỆ THỐNG */}
            {activeTab === "overview" && stats && (
              <div style={{ display: "grid", gap: "24px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <div
                    onClick={() => setActiveTab("revenue")}
                    style={{
                      background: "linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 229, 255, 0.05))",
                      border: "1px solid rgba(0, 255, 136, 0.3)",
                      borderRadius: "12px",
                      padding: "20px",
                      cursor: "pointer",
                      transition: "transform 0.15s",
                    }}
                  >
                    <div style={{ fontSize: "0.75rem", color: "#7a8fa6", marginBottom: "8px" }}>
                      TỔNG DOANH THU BÁN HÀNG (PAID)
                    </div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#00ff88" }}>
                      {vnd(revenueData?.summary?.totalRevenue || 0)}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#00e5ff", marginTop: "6px" }}>
                      💰 {revenueData?.summary?.paidOrdersCount || 0} đơn đã thanh toán (Bấm xem chi tiết →)
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#0d141e",
                      border: "1px solid rgba(0, 229, 255, 0.15)",
                      borderRadius: "12px",
                      padding: "20px",
                    }}
                  >
                    <div style={{ fontSize: "0.75rem", color: "#7a8fa6", marginBottom: "8px" }}>
                      TỔNG SỐ NGƯỜI DÙNG
                    </div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#00e5ff" }}>
                      {stats.counts.users}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#00ff88", marginTop: "6px" }}>
                      ⚡ {stats.counts.googleUsers} tài khoản Google OAuth
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#0d141e",
                      border: "1px solid rgba(0, 229, 255, 0.15)",
                      borderRadius: "12px",
                      padding: "20px",
                    }}
                  >
                    <div style={{ fontSize: "0.75rem", color: "#7a8fa6", marginBottom: "8px" }}>
                      LINH KIỆN TRONG KHO
                    </div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffb800" }}>
                      {stats.counts.products}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#7a8fa6", marginTop: "6px" }}>
                      Thuộc {stats.counts.categories} danh mục sản phẩm
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#0d141e",
                      border: "1px solid rgba(0, 229, 255, 0.15)",
                      borderRadius: "12px",
                      padding: "20px",
                    }}
                  >
                    <div style={{ fontSize: "0.75rem", color: "#7a8fa6", marginBottom: "8px" }}>
                      KẾT NỐI MONGODB ATLAS
                    </div>
                    <div
                      style={{
                        fontSize: "1.4rem",
                        fontWeight: 800,
                        color: stats.database.status === "Connected" ? "#00ff88" : "#ff4b4b",
                      }}
                    >
                      {stats.database.status === "Connected" ? "● Connected" : "○ Disconnected"}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#7a8fa6", marginTop: "6px" }}>
                      DB: {stats.database.name}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#0d141e",
                      border: "1px solid rgba(0, 229, 255, 0.15)",
                      borderRadius: "12px",
                      padding: "20px",
                    }}
                  >
                    <div style={{ fontSize: "0.75rem", color: "#7a8fa6", marginBottom: "8px" }}>
                      UPTIME MÁY CHỦ
                    </div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#e8edf2" }}>
                      {stats.system.uptimeSeconds}s
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#7a8fa6", marginTop: "6px" }}>
                      Node {stats.system.nodeVersion} · RAM {stats.system.memoryRssMb}MB
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "#0d141e",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    padding: "22px",
                  }}
                >
                  <h3 style={{ fontSize: "0.95rem", color: "#00e5ff", marginBottom: "12px" }}>
                    🚀 Cấu hình OAuth Google API
                  </h3>
                  <p style={{ fontSize: "0.82rem", color: "#7a8fa6", lineHeight: 1.6 }}>
                    Trạng thái Client ID:{" "}
                    <strong
                      style={{
                        color: stats.system.googleOauthConfigured ? "#00ff88" : "#ff4b4b",
                      }}
                    >
                      {stats.system.googleOauthConfigured
                        ? "ĐÃ KÍCH HOẠT (ACTIVE)"
                        : "CHƯA CẤU HÌNH"}
                    </strong>
                  </p>
                </div>
              </div>
            )}

            {/* TAB: QUẢN LÝ NGƯỜI DÙNG */}
            {activeTab === "users" && (
              <div
                style={{
                  background: "#0d141e",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <h3 style={{ fontSize: "0.95rem", color: "#00e5ff" }}>
                    Danh sách người dùng đã đăng ký ({userList.length})
                  </h3>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ background: "rgba(0,0,0,0.3)", color: "#7a8fa6", textAlign: "left" }}>
                      <th style={{ padding: "12px 16px" }}>NGƯỜI DÙNG</th>
                      <th style={{ padding: "12px 16px" }}>EMAIL</th>
                      <th style={{ padding: "12px 16px" }}>PHƯƠNG THỨC ĐĂNG NHẬP</th>
                      <th style={{ padding: "12px 16px" }}>VAI TRÒ</th>
                      <th style={{ padding: "12px 16px", textAlign: "right" }}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map((u) => (
                      <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt=""
                              style={{ width: 28, height: 28, borderRadius: "50%" }}
                            />
                          ) : (
                            <span
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                background: "#00e5ff",
                                color: "#000",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: "0.75rem",
                              }}
                            >
                              {u.username[0]?.toUpperCase()}
                            </span>
                          )}
                          <span style={{ fontWeight: 600 }}>@{u.username}</span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#c4c7c5" }}>{u.email}</td>
                        <td style={{ padding: "12px 16px" }}>
                          {u.isGoogleUser ? (
                            <span
                              style={{
                                background: "rgba(66, 133, 244, 0.15)",
                                border: "1px solid rgba(66, 133, 244, 0.4)",
                                color: "#8ab4f8",
                                padding: "2px 8px",
                                borderRadius: 4,
                                fontSize: "0.72rem",
                              }}
                            >
                              ⚡ Google OAuth
                            </span>
                          ) : (
                            <span style={{ color: "#7a8fa6", fontSize: "0.72rem" }}>
                              Tài khoản thường
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              color: u.role === "admin" ? "#00ff88" : "#7a8fa6",
                              fontWeight: u.role === "admin" ? 700 : 400,
                            }}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          {u.username !== "gay" ? (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              style={{
                                background: "rgba(255, 75, 75, 0.1)",
                                border: "1px solid rgba(255, 75, 75, 0.3)",
                                color: "#ff4b4b",
                                padding: "4px 10px",
                                borderRadius: 4,
                                fontSize: "0.72rem",
                                cursor: "pointer",
                              }}
                            >
                              Xóa
                            </button>
                          ) : (
                            <span style={{ fontSize: "0.72rem", color: "#00ff88" }}>Gốc (Root)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: MÁY CHỦ & BẢO TRÌ */}
            {activeTab === "system" && stats && (
              <div style={{ display: "grid", gap: "24px", maxWidth: "800px" }}>
                <div
                  style={{
                    background: "#0d141e",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    padding: "22px",
                  }}
                >
                  <h3 style={{ fontSize: "0.95rem", color: "#00e5ff", marginBottom: "16px" }}>
                    ⚙️ Thông tin môi trường chạy (Runtime Environment)
                  </h3>
                  <div style={{ display: "grid", gap: "10px", fontSize: "0.82rem" }}>
                    <div>
                      <span style={{ color: "#7a8fa6" }}>Hệ điều hành: </span>
                      <strong>{stats.system.platform}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#7a8fa6" }}>Phiên bản Node.js: </span>
                      <strong>{stats.system.nodeVersion}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#7a8fa6" }}>Bộ nhớ sử dụng (RSS): </span>
                      <strong>{stats.system.memoryRssMb} MB</strong>
                    </div>
                    <div>
                      <span style={{ color: "#7a8fa6" }}>MongoDB Host: </span>
                      <strong style={{ color: "#00ff88" }}>{stats.database.host}</strong>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "#0d141e",
                    border: "1px solid rgba(255, 75, 75, 0.2)",
                    borderRadius: "12px",
                    padding: "22px",
                  }}
                >
                  <h3 style={{ fontSize: "0.95rem", color: "#ff4b4b", marginBottom: "8px" }}>
                    ⚠️ Vùng công cụ bảo trì
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "#7a8fa6", marginBottom: "16px" }}>
                    Bấm nút dưới đây để nạp lại dữ liệu khởi tạo (16 linh kiện mẫu, danh mục, bài viết) nếu database bị xóa.
                  </p>
                  <button
                    onClick={handleResetSeed}
                    style={{
                      background: "rgba(0, 229, 255, 0.1)",
                      border: "1px solid #00e5ff",
                      color: "#00e5ff",
                      padding: "8px 18px",
                      borderRadius: 6,
                      fontFamily: "inherit",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    🔄 Nạp lại dữ liệu mẫu vào MongoDB
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
