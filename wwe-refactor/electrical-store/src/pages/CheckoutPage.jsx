import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useCart, clearCart } from "../lib/cart.js";
import { vnd } from "../lib/format.js";
import { useAuth } from "../lib/auth.jsx";
import { api } from "../lib/api.js";
import { usePageStylesheets } from "../lib/usePageStyles.js";

const MONO = "'JetBrains Mono', monospace";

const PROVINCES = [
  "TP. Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Bình Dương",
  "Đồng Nai",
  "Hải Phòng",
  "Cần Thơ",
  "Bà Rịa - Vũng Tàu",
  "Bắc Ninh",
  "Quảng Ninh",
  "Khánh Hòa",
  "Lâm Đồng",
  "Huế",
  "Nghệ An",
  "Thanh Hóa",
  "Tỉnh thành khác...",
];

export default function CheckoutPage() {
  const ready = usePageStylesheets([
    "/styles/variant/style.css",
    "/styles/shop-page.css",
  ]);

  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form Shipping State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [province, setProvince] = useState("TP. Hồ Chí Minh");
  const [district, setDistrict] = useState("");
  const [street, setStreet] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    document.title = "Thanh toán đơn hàng – VoltCore Electronics";
  }, []);

  // Tự động điền email nếu người dùng đã đăng nhập
  useEffect(() => {
    if (user) {
      if (user.username && !fullName) setFullName(user.username);
      if (user.email && !email) setEmail(user.email);
    }
  }, [user, fullName, email]);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingFee = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
  const totalAmount = subtotal + shippingFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (cart.length === 0) {
      setErrorMsg("Giỏ hàng của bạn đang trống! Vui lòng chọn sản phẩm trước khi thanh toán.");
      return;
    }

    if (!fullName.trim() || !phone.trim() || !street.trim()) {
      setErrorMsg("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng.");
      return;
    }

    // Kiểm tra định dạng số điện thoại Việt Nam
    const cleanPhone = phone.replace(/\s+/g, "");
    if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(cleanPhone)) {
      setErrorMsg("Số điện thoại không hợp lệ. Vui lòng nhập đúng số điện thoại (vd: 0912345678).");
      return;
    }

    try {
      setBusy(true);

      const payload = {
        items: cart.map((i) => ({
          slug: i.slug || i.id,
          name: i.name,
          brand: i.brand || "",
          image: i.img || i.image || "",
          price: i.price,
          quantity: i.qty,
        })),
        shipping: {
          fullName: fullName.trim(),
          phone: cleanPhone,
          email: email.trim(),
          province,
          district: district.trim() || province,
          street: street.trim(),
          note: note.trim(),
        },
        paymentMethod,
      };

      const res = await api("/api/orders", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        setErrorMsg(res.data?.error || "Không thể tạo đơn hàng, vui lòng thử lại!");
        return;
      }

      const orderCode = res.data?.orderCode || res.data?.order?.orderCode;

      // Xóa sạch giỏ hàng sau khi đặt thành công
      clearCart();

      // Chuyển hướng ngay tới trang Hóa đơn & Thanh toán VietQR
      navigate(`/payment/${orderCode}`);
    } catch (err) {
      setErrorMsg(err?.message || "Lỗi kết nối khi gửi đơn hàng");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return null;

  return (
    <>
      <Navbar
        logo="icon"
        links={[
          { label: "Home", to: "/" },
          { label: "Products", to: "/shop" },
          { label: "Projects", to: "/projects" },
          { label: "Blog", to: "/blog" },
          { label: "Contact", to: "/#contact-section" },
        ]}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 5% 80px", color: "var(--text, #f9fafb)" }}>
        {/* Breadcrumb */}
        <div style={{ fontFamily: MONO, fontSize: "0.78rem", color: "var(--text-muted, #7a8fa6)", marginBottom: 20 }}>
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px", opacity: 0.5 }}>›</span>
          <Link to="/shop" style={{ color: "inherit", textDecoration: "none" }}>Shop</Link>
          <span style={{ margin: "0 8px", opacity: 0.5 }}>›</span>
          <span style={{ color: "var(--accent, #00e5ff)" }}>Thanh toán hóa đơn</span>
        </div>

        {/* Tiêu đề trang */}
        <div style={{ marginBottom: 28, borderBottom: "1px solid rgba(0, 229, 255, 0.15)", paddingBottom: 16 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.74rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--accent, #00e5ff)",
              fontFamily: MONO,
              marginBottom: 6,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent, #00e5ff)", display: "inline-block" }} />
            SECURE CHECKOUT &amp; VIETQR GATEWAY
          </div>
          <h1
            style={{
              fontFamily: MONO,
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 800,
              color: "#fff",
              margin: 0,
            }}
          >
            Thanh toán &amp; <span style={{ color: "var(--accent, #00e5ff)" }}>Tạo hóa đơn</span>
          </h1>
        </div>

        {/* NẾU GIỎ HÀNG TRỐNG */}
        {cart.length === 0 ? (
          <div
            style={{
              background: "#080c14",
              border: "1px solid rgba(0, 229, 255, 0.2)",
              borderRadius: 16,
              padding: "60px 24px",
              textAlign: "center",
              maxWidth: 580,
              margin: "30px auto",
            }}
          >
            <div style={{ fontSize: "3.5rem", marginBottom: 14 }}>🛒</div>
            <h2 style={{ fontFamily: MONO, fontSize: "1.3rem", fontWeight: 700, color: "#fff", marginBottom: 10 }}>
              Giỏ hàng của bạn đang trống
            </h2>
            <p style={{ color: "var(--text-muted, #7a8fa6)", fontSize: "0.9rem", marginBottom: 26, lineHeight: 1.6 }}>
              Bạn chưa có linh kiện nào trong giỏ hàng. Hãy dạo quanh cửa hàng và chọn những module vi điều khiển, cảm biến yêu thích nhé!
            </p>
            <Link
              to="/shop"
              style={{
                display: "inline-block",
                background: "var(--accent, #00e5ff)",
                color: "#030712",
                padding: "12px 28px",
                borderRadius: 8,
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: "0.88rem",
                textDecoration: "none",
              }}
            >
              ← Khám phá cửa hàng linh kiện
            </Link>
          </div>
        ) : (
          /* FORM ĐẶT HÀNG 2 CỘT */
          <form onSubmit={handleSubmit} noValidate>
            {errorMsg && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid #ef4444",
                  borderRadius: 8,
                  padding: "12px 16px",
                  color: "#f87171",
                  fontFamily: MONO,
                  fontSize: "0.85rem",
                  marginBottom: 24,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: 28,
                alignItems: "start",
              }}
            >
              {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG & PHƯƠNG THỨC THANH TOÁN */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* 1. THÔNG TIN NGƯỜI NHẬN */}
                <div
                  style={{
                    background: "#080c14",
                    border: "1px solid rgba(0, 229, 255, 0.18)",
                    borderRadius: 14,
                    padding: "24px 26px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "var(--accent, #00e5ff)",
                      marginBottom: 18,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>📍</span>
                    <span>1. Thông tin giao nhận hàng</span>
                  </div>

                  <div style={{ display: "grid", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontFamily: MONO, fontSize: "0.78rem", color: "#a5b4fc", marginBottom: 6 }}>
                        Họ và tên người nhận <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="vd: Nguyễn Văn A"
                        required
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "11px 14px",
                          background: "#04070e",
                          border: "1px solid rgba(0, 229, 255, 0.2)",
                          borderRadius: 8,
                          color: "#fff",
                          fontFamily: MONO,
                          fontSize: "0.88rem",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div>
                        <label style={{ display: "block", fontFamily: MONO, fontSize: "0.78rem", color: "#a5b4fc", marginBottom: 6 }}>
                          Số điện thoại <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="vd: 0912345678"
                          required
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "11px 14px",
                            background: "#04070e",
                            border: "1px solid rgba(0, 229, 255, 0.2)",
                            borderRadius: 8,
                            color: "#fff",
                            fontFamily: MONO,
                            fontSize: "0.88rem",
                            outline: "none",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontFamily: MONO, fontSize: "0.78rem", color: "#a5b4fc", marginBottom: 6 }}>
                          Email nhận hóa đơn
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@example.com"
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "11px 14px",
                            background: "#04070e",
                            border: "1px solid rgba(0, 229, 255, 0.2)",
                            borderRadius: 8,
                            color: "#fff",
                            fontFamily: MONO,
                            fontSize: "0.88rem",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div>
                        <label style={{ display: "block", fontFamily: MONO, fontSize: "0.78rem", color: "#a5b4fc", marginBottom: 6 }}>
                          Tỉnh / Thành phố <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <select
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "11px 14px",
                            background: "#04070e",
                            border: "1px solid rgba(0, 229, 255, 0.2)",
                            borderRadius: 8,
                            color: "#fff",
                            fontFamily: MONO,
                            fontSize: "0.85rem",
                            outline: "none",
                            cursor: "pointer",
                          }}
                        >
                          {PROVINCES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: "block", fontFamily: MONO, fontSize: "0.78rem", color: "#a5b4fc", marginBottom: 6 }}>
                          Quận / Huyện
                        </label>
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="vd: Quận 1, Cầu Giấy..."
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "11px 14px",
                            background: "#04070e",
                            border: "1px solid rgba(0, 229, 255, 0.2)",
                            borderRadius: 8,
                            color: "#fff",
                            fontFamily: MONO,
                            fontSize: "0.88rem",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: MONO, fontSize: "0.78rem", color: "#a5b4fc", marginBottom: 6 }}>
                        Địa chỉ nhận hàng cụ thể (Số nhà, đường...) <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="vd: 123 Đường Nguyễn Huệ, Phường Bến Nghé"
                        required
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "11px 14px",
                          background: "#04070e",
                          border: "1px solid rgba(0, 229, 255, 0.2)",
                          borderRadius: 8,
                          color: "#fff",
                          fontFamily: MONO,
                          fontSize: "0.88rem",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: MONO, fontSize: "0.78rem", color: "#a5b4fc", marginBottom: 6 }}>
                        Ghi chú đơn hàng (Tùy chọn)
                      </label>
                      <textarea
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Ghi chú thêm về thời gian giao hàng, gọi trước khi đến..."
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "10px 14px",
                          background: "#04070e",
                          border: "1px solid rgba(0, 229, 255, 0.2)",
                          borderRadius: 8,
                          color: "#fff",
                          fontFamily: MONO,
                          fontSize: "0.85rem",
                          outline: "none",
                          resize: "vertical",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. PHƯƠNG THỨC THANH TOÁN */}
                <div
                  style={{
                    background: "#080c14",
                    border: "1px solid rgba(0, 229, 255, 0.18)",
                    borderRadius: 14,
                    padding: "24px 26px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "var(--accent, #00e5ff)",
                      marginBottom: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>💳</span>
                    <span>2. Chọn phương thức thanh toán</span>
                  </div>

                  <div style={{ display: "grid", gap: 12 }}>
                    {/* OPTION 1: VIETQR (RECOMMENDED) */}
                    <label
                      onClick={() => setPaymentMethod("BANK_TRANSFER")}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 14,
                        padding: "16px 18px",
                        background: paymentMethod === "BANK_TRANSFER" ? "rgba(0, 229, 255, 0.08)" : "#04070e",
                        border: paymentMethod === "BANK_TRANSFER" ? "2px solid #00e5ff" : "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 10,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "BANK_TRANSFER"}
                        onChange={() => setPaymentMethod("BANK_TRANSFER")}
                        style={{ marginTop: 4 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <span style={{ fontFamily: MONO, fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>
                            ⚡ Chuyển khoản VietQR 24/7 (Quét mã QR Ngân hàng)
                          </span>
                          <span
                            style={{
                              background: "#00e5ff",
                              color: "#030712",
                              fontSize: "0.68rem",
                              fontWeight: 800,
                              padding: "2px 8px",
                              borderRadius: 4,
                              fontFamily: MONO,
                            }}
                          >
                            KHUYÊN DÙNG
                          </span>
                        </div>
                        <div style={{ color: "var(--text-muted, #7a8fa6)", fontSize: "0.8rem", lineHeight: 1.5 }}>
                          Thanh toán tức thì qua mã QR chuẩn Napas 247 trên mọi ứng dụng Ngân hàng (MB, VCB, Techcombank, VPBank, ACB...) và ví MoMo.
                        </div>
                      </div>
                    </label>

                    {/* OPTION 2: COD */}
                    <label
                      onClick={() => setPaymentMethod("COD")}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 14,
                        padding: "16px 18px",
                        background: paymentMethod === "COD" ? "rgba(0, 229, 255, 0.08)" : "#04070e",
                        border: paymentMethod === "COD" ? "2px solid #00e5ff" : "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 10,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        style={{ marginTop: 4 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: MONO, fontWeight: 700, color: "#fff", fontSize: "0.95rem", marginBottom: 4 }}>
                          📦 Thanh toán tiền mặt khi nhận hàng (COD)
                        </div>
                        <div style={{ color: "var(--text-muted, #7a8fa6)", fontSize: "0.8rem", lineHeight: 1.5 }}>
                          Thanh toán tiền mặt trực tiếp cho nhân viên giao hàng khi nhận linh kiện.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG & NÚT TẠO HÓA ĐƠN */}
              <div
                style={{
                  background: "#080c14",
                  border: "1px solid rgba(0, 229, 255, 0.2)",
                  borderRadius: 14,
                  padding: "24px 26px",
                  position: "sticky",
                  top: 90,
                  boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 16,
                    paddingBottom: 12,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>🧾 Đơn hàng ({cart.reduce((s, i) => s + i.qty, 0)} linh kiện)</span>
                  <Link to="/shop" style={{ fontSize: "0.75rem", color: "var(--accent, #00e5ff)", textDecoration: "none" }}>
                    Sửa giỏ hàng
                  </Link>
                </div>

                {/* DANH SÁCH LINH KIỆN TRONG ĐƠN */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 280, overflowY: "auto", marginBottom: 20 }}>
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        paddingBottom: 10,
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 6,
                          background: "#04070e",
                          border: "1px solid rgba(255,255,255,0.08)",
                          overflow: "hidden",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={item.img}
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = "/assets/products/Microcontrollers.png";
                          }}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: MONO, fontSize: "0.82rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted, #7a8fa6)" }}>
                          {vnd(item.price)} × {item.qty}
                        </div>
                      </div>

                      <div style={{ fontFamily: MONO, fontSize: "0.85rem", fontWeight: 700, color: "var(--accent, #00e5ff)" }}>
                        {vnd(item.price * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* TÍNH TOÁN TIỀN */}
                <div style={{ display: "grid", gap: 10, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted, #7a8fa6)" }}>
                    <span>Tạm tính tiền hàng:</span>
                    <span style={{ fontFamily: MONO, color: "#fff" }}>{vnd(subtotal)}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted, #7a8fa6)" }}>
                    <span>Phí vận chuyển toàn quốc:</span>
                    <span style={{ fontFamily: MONO, color: shippingFee === 0 ? "#00ff88" : "#fff" }}>
                      {shippingFee === 0 ? "Miễn phí (Đơn > 500k)" : vnd(shippingFee)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "#fff",
                      borderTop: "1px dashed rgba(255,255,255,0.15)",
                      paddingTop: 12,
                      marginTop: 4,
                    }}
                  >
                    <span>Tổng thanh toán:</span>
                    <span style={{ fontFamily: MONO, color: "var(--accent, #00e5ff)", fontSize: "1.25rem" }}>
                      {vnd(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* NÚT TẠO HÓA ĐƠN & THANH TOÁN */}
                <button
                  type="submit"
                  disabled={busy}
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    background: "var(--accent, #00e5ff)",
                    color: "#030712",
                    border: "none",
                    borderRadius: 8,
                    fontFamily: MONO,
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    cursor: busy ? "not-allowed" : "pointer",
                    boxShadow: "0 0 20px rgba(0, 229, 255, 0.4)",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {busy ? "Đang tạo hóa đơn..." : paymentMethod === "BANK_TRANSFER" ? "⚡ Tạo hóa đơn & Quét mã VietQR →" : "📦 Xác nhận đặt hàng (COD) →"}
                </button>

                <div style={{ textAlign: "center", fontSize: "0.72rem", color: "var(--text-muted, #7a8fa6)", marginTop: 12 }}>
                  🔒 Giao dịch bảo mật qua cổng thanh toán liên ngân hàng Napas 247
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </>
  );
}
