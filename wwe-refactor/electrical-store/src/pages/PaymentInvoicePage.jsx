import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { vnd } from "../lib/format.js";
import { api } from "../lib/api.js";
import { usePageStylesheets } from "../lib/usePageStyles.js";

const MONO = "'JetBrains Mono', monospace";

export default function PaymentInvoicePage() {
  const ready = usePageStylesheets([
    "/styles/variant/style.css",
    "/styles/shop-page.css",
  ]);

  const { orderCode } = useParams();

  const [order, setOrder] = useState(null);
  const [bankConfig, setBankConfig] = useState(null);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    document.title = `Hóa đơn ${orderCode || ""} – VoltCore Electronics`;
  }, [orderCode]);

  // Tải chi tiết đơn hàng & cấu hình VietQR
  useEffect(() => {
    if (!orderCode) return;

    setLoading(true);
    api(`/api/orders/${orderCode}`)
      .then(async (res) => {
        if (!res.ok) {
          setErrorMsg(res.data?.error || "Không tìm thấy hóa đơn đơn hàng");
          return;
        }

        const ord = res.data.order;
        setOrder(ord);
        setBankConfig(res.data.bankConfig);

        if (ord.paymentStatus === "PAID") {
          setPaymentSuccess(true);
        }

        // Tạo URL ảnh mã VietQR dự phòng ngay lập tức
        const directUrl =
          res.data.vietqrUrl ||
          `https://img.vietqr.io/image/MB-33669917012007-compact2.png?amount=${ord.totalAmount}&addInfo=${encodeURIComponent(ord.orderCode)}&accountName=NGO%20MINH%20QUAN`;
        setQrImageUrl(directUrl);

        // Gọi API VietQR để lấy mã QR chất lượng cao
        try {
          const qrRes = await api("/api/orders/vietqr/generate", {
            method: "POST",
            body: {
              amount: ord.totalAmount,
              orderCode: ord.orderCode,
            },
          });
          if (qrRes.ok && (qrRes.data?.qrDataURL || qrRes.data?.directImageUrl)) {
            setQrImageUrl(qrRes.data.qrDataURL || qrRes.data.directImageUrl);
          }
        } catch {
          // Fallback đã có directUrl
        }
      })
      .catch((err) => {
        setErrorMsg(err?.message || "Lỗi khi tải thông tin đơn hàng");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderCode]);

  // Sao chép nội dung vào Clipboard
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Xác nhận đã thanh toán
  const handleConfirmPaid = async () => {
    try {
      setVerifying(true);
      const res = await api(`/api/orders/${orderCode}/pay`, { method: "POST" });
      if (res.ok) {
        setOrder(res.data.order);
        setPaymentSuccess(true);
      } else {
        alert(res.data?.error || "Không thể cập nhật trạng thái thanh toán");
      }
    } catch {
      alert("Lỗi kết nối khi xác nhận thanh toán");
    } finally {
      setVerifying(false);
    }
  };

  // Tải ảnh mã QR về máy
  const handleDownloadQR = () => {
    if (!qrImageUrl) return;
    const a = document.createElement("a");
    a.href = qrImageUrl;
    a.download = `VietQR_${orderCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // In hóa đơn
  const handlePrint = () => {
    window.print();
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

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "100px 5% 80px", color: "var(--text, #f9fafb)" }}>
        {/* Breadcrumb */}
        <div style={{ fontFamily: MONO, fontSize: "0.78rem", color: "var(--text-muted, #7a8fa6)", marginBottom: 20 }}>
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px", opacity: 0.5 }}>›</span>
          <Link to="/shop" style={{ color: "inherit", textDecoration: "none" }}>Shop</Link>
          <span style={{ margin: "0 8px", opacity: 0.5 }}>›</span>
          <span style={{ color: "var(--accent, #00e5ff)" }}>Hóa đơn thanh toán</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: MONO, color: "var(--accent, #00e5ff)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚡</div>
            <div>Đang tải dữ liệu hóa đơn &amp; tạo mã VietQR...</div>
          </div>
        ) : errorMsg || !order ? (
          <div
            style={{
              background: "#080c14",
              border: "1px solid #ef4444",
              borderRadius: 14,
              padding: "48px 24px",
              textAlign: "center",
              maxWidth: 500,
              margin: "40px auto",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>⚠️</div>
            <h2 style={{ fontFamily: MONO, fontSize: "1.2rem", color: "#f87171", marginBottom: 12 }}>
              {errorMsg || "Không tìm thấy hóa đơn"}
            </h2>
            <Link
              to="/shop"
              style={{
                display: "inline-block",
                background: "var(--accent, #00e5ff)",
                color: "#030712",
                padding: "10px 22px",
                borderRadius: 6,
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: "0.85rem",
                textDecoration: "none",
                marginTop: 10,
              }}
            >
              ← Quay lại cửa hàng
            </Link>
          </div>
        ) : (
          <div>
            {/* THANH THÔNG TIN ĐẦU HÓA ĐƠN */}
            <div
              style={{
                background: "#080c14",
                border: "1px solid rgba(0, 229, 255, 0.25)",
                borderRadius: 14,
                padding: "20px 26px",
                marginBottom: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              <div>
                <div style={{ fontSize: "0.74rem", fontFamily: MONO, color: "var(--text-muted, #7a8fa6)", marginBottom: 4 }}>
                  MÃ HÓA ĐƠN ĐIỆN TỬ
                </div>
                <div style={{ fontFamily: MONO, fontSize: "1.4rem", fontWeight: 800, color: "#fff", letterSpacing: "0.03em" }}>
                  {order.orderCode}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted, #7a8fa6)", marginTop: 4 }}>
                  Ngày tạo: {new Date(order.createdAt).toLocaleString("vi-VN")}
                </div>
              </div>

              {/* TRẠNG THÁI THANH TOÁN BADGE */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {paymentSuccess || order.paymentStatus === "PAID" ? (
                  <div
                    style={{
                      background: "rgba(34, 197, 94, 0.15)",
                      border: "2px solid #22c55e",
                      borderRadius: 100,
                      padding: "8px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#4ade80",
                      fontFamily: MONO,
                      fontWeight: 800,
                      fontSize: "0.88rem",
                      boxShadow: "0 0 20px rgba(34, 197, 94, 0.3)",
                    }}
                  >
                    <span>✅</span>
                    <span>ĐÃ THANH TOÁN (PAID)</span>
                  </div>
                ) : (
                  <div
                    style={{
                      background: "rgba(245, 158, 11, 0.12)",
                      border: "2px solid #f59e0b",
                      borderRadius: 100,
                      padding: "8px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#fbbf24",
                      fontFamily: MONO,
                      fontWeight: 800,
                      fontSize: "0.88rem",
                      animation: "pulse 2s infinite",
                    }}
                  >
                    <span>⏳</span>
                    <span>CHỜ THANH TOÁN (UNPAID)</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handlePrint}
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontFamily: MONO,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>🖨️</span> In hóa đơn
                </button>
              </div>
            </div>

            {/* BỐ CỤC CHÍNH 2 CỘT */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                gap: 28,
                alignItems: "start",
              }}
            >
              {/* CỘT TRÁI: KHUNG MÃ QR VIETQR & HƯỚNG DẪN THANH TOÁN */}
              <div
                style={{
                  background: "#080c14",
                  border: "1px solid rgba(0, 229, 255, 0.25)",
                  borderRadius: 16,
                  padding: "26px",
                  boxShadow: "0 6px 28px rgba(0,0,0,0.4)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontFamily: MONO,
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    color: "var(--accent, #00e5ff)",
                    marginBottom: 6,
                  }}
                >
                  <span>⚡</span>
                  <span>THANH TOÁN QUA MÃ VIETQR</span>
                </div>
                <p style={{ color: "var(--text-muted, #7a8fa6)", fontSize: "0.8rem", marginBottom: 20 }}>
                  Quét mã QR bằng ứng dụng ngân hàng hoặc MoMo để thanh toán 24/7 tức thì
                </p>

                {/* VÙNG HIỂN THỊ MÃ QR VIETQR */}
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    padding: 16,
                    display: "inline-block",
                    boxShadow: "0 10px 30px rgba(0, 229, 255, 0.25)",
                    border: "3px solid #00e5ff",
                    maxWidth: 320,
                    width: "100%",
                    boxSizing: "border-box",
                    margin: "0 auto 18px",
                  }}
                >
                  {qrImageUrl ? (
                    <img
                      src={qrImageUrl}
                      alt="VietQR Payment Code"
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        borderRadius: 8,
                      }}
                    />
                  ) : (
                    <div style={{ padding: "60px 0", color: "#666", fontFamily: MONO, fontSize: "0.85rem" }}>
                      Đang sinh mã QR...
                    </div>
                  )}
                </div>

                {/* NÚT TẢI MÃ QR */}
                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 22 }}>
                  <button
                    type="button"
                    onClick={handleDownloadQR}
                    style={{
                      background: "rgba(0, 229, 255, 0.1)",
                      border: "1px solid rgba(0, 229, 255, 0.3)",
                      color: "var(--accent, #00e5ff)",
                      borderRadius: 6,
                      padding: "7px 16px",
                      fontFamily: MONO,
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    📥 Tải ảnh mã QR
                  </button>
                </div>

                {/* HỘP THÔNG TIN TÀI KHOẢN CHUYỂN KHOẢN CÓ NÚT COPY */}
                <div
                  style={{
                    background: "#04070e",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 10,
                    padding: "16px 18px",
                    textAlign: "left",
                    display: "grid",
                    gap: 12,
                    fontFamily: MONO,
                    fontSize: "0.82rem",
                    marginBottom: 20,
                  }}
                >
                  {/* Ngân hàng */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-muted, #7a8fa6)" }}>Ngân hàng:</span>
                    <strong style={{ color: "#fff" }}>MB Bank (Quân Đội)</strong>
                  </div>

                  {/* Số tài khoản */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-muted, #7a8fa6)" }}>Số tài khoản:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <strong style={{ color: "var(--accent, #00e5ff)", fontSize: "0.95rem" }}>
                        {bankConfig?.accountNo || "33669917012007"}
                      </strong>
                      <button
                        type="button"
                        onClick={() => handleCopy(bankConfig?.accountNo || "33669917012007", "acc")}
                        style={{
                          background: copiedKey === "acc" ? "#00ff88" : "rgba(255,255,255,0.1)",
                          color: copiedKey === "acc" ? "#030712" : "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "2px 8px",
                          fontSize: "0.7rem",
                          cursor: "pointer",
                          fontWeight: 700,
                        }}
                      >
                        {copiedKey === "acc" ? "Đã chép ✓" : "Sao chép"}
                      </button>
                    </div>
                  </div>

                  {/* Chủ tài khoản */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-muted, #7a8fa6)" }}>Chủ tài khoản:</span>
                    <strong style={{ color: "#fff" }}>{bankConfig?.accountName || "NGO MINH QUAN"}</strong>
                  </div>

                  {/* Số tiền */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-muted, #7a8fa6)" }}>Số tiền:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <strong style={{ color: "#00ff88", fontSize: "1.05rem" }}>
                        {vnd(order.totalAmount)}
                      </strong>
                      <button
                        type="button"
                        onClick={() => handleCopy(String(order.totalAmount), "amt")}
                        style={{
                          background: copiedKey === "amt" ? "#00ff88" : "rgba(255,255,255,0.1)",
                          color: copiedKey === "amt" ? "#030712" : "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "2px 8px",
                          fontSize: "0.7rem",
                          cursor: "pointer",
                          fontWeight: 700,
                        }}
                      >
                        {copiedKey === "amt" ? "Đã chép ✓" : "Sao chép"}
                      </button>
                    </div>
                  </div>

                  {/* Nội dung chuyển khoản */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px dashed rgba(255,255,255,0.1)",
                      paddingTop: 10,
                    }}
                  >
                    <span style={{ color: "#fbbf24" }}>Nội dung CK:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <strong style={{ color: "#fbbf24", fontSize: "0.95rem" }}>
                        {order.orderCode}
                      </strong>
                      <button
                        type="button"
                        onClick={() => handleCopy(order.orderCode, "code")}
                        style={{
                          background: copiedKey === "code" ? "#00ff88" : "#fbbf24",
                          color: "#030712",
                          border: "none",
                          borderRadius: 4,
                          padding: "2px 8px",
                          fontSize: "0.7rem",
                          cursor: "pointer",
                          fontWeight: 800,
                        }}
                      >
                        {copiedKey === "code" ? "Đã chép ✓" : "Sao chép"}
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(245, 158, 11, 0.08)",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#fef08a",
                    fontSize: "0.74rem",
                    lineHeight: 1.5,
                    marginBottom: 20,
                    textAlign: "left",
                  }}
                >
                  ⚠️ <strong>Lưu ý quan trọng:</strong> Quý khách vui lòng giữ nguyên nội dung chuyển khoản là{" "}
                  <strong style={{ color: "#fff" }}>{order.orderCode}</strong> để hệ thống tự động gạch nợ và xác nhận hóa đơn tức thì.
                </div>

                {/* NÚT XÁC NHẬN HOÀN TẤT THANH TOÁN */}
                {!paymentSuccess && order.paymentStatus !== "PAID" ? (
                  <button
                    type="button"
                    onClick={handleConfirmPaid}
                    disabled={verifying}
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: "linear-gradient(135deg, #00ff88, #00e5ff)",
                      color: "#030712",
                      border: "none",
                      borderRadius: 8,
                      fontFamily: MONO,
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      cursor: verifying ? "not-allowed" : "pointer",
                      boxShadow: "0 0 20px rgba(0, 255, 136, 0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <span>{verifying ? "Đang kiểm tra..." : "✅ Tôi đã hoàn tất chuyển khoản VietQR"}</span>
                  </button>
                ) : (
                  <div
                    style={{
                      background: "rgba(34, 197, 94, 0.15)",
                      border: "1px solid #22c55e",
                      borderRadius: 8,
                      padding: "14px",
                      color: "#4ade80",
                      fontFamily: MONO,
                      fontWeight: 700,
                      fontSize: "0.9rem",
                    }}
                  >
                    🎉 Hóa đơn đã được xác nhận thanh toán thành công! VoltCore đang tiến hành đóng gói và giao hàng.
                  </div>
                )}
              </div>

              {/* CỘT PHẢI: CHI TIẾT HÓA ĐƠN ĐƠN HÀNG */}
              <div
                style={{
                  background: "#080c14",
                  border: "1px solid rgba(0, 229, 255, 0.2)",
                  borderRadius: 16,
                  padding: "26px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 18,
                    paddingBottom: 12,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>📋 Chi tiết hóa đơn linh kiện</span>
                  <span style={{ fontSize: "0.78rem", color: "var(--accent, #00e5ff)" }}>
                    {order.itemCount} sản phẩm
                  </span>
                </div>

                {/* THÔNG TIN KHÁCH HÀNG & GIAO NHẬN */}
                <div
                  style={{
                    background: "#04070e",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "14px 16px",
                    marginBottom: 20,
                    fontSize: "0.82rem",
                    display: "grid",
                    gap: 8,
                    fontFamily: MONO,
                  }}
                >
                  <div>
                    <span style={{ color: "var(--text-muted, #7a8fa6)" }}>Người nhận: </span>
                    <strong style={{ color: "#fff" }}>{order.shipping.fullName}</strong> · {order.shipping.phone}
                  </div>
                  {order.shipping.email && (
                    <div>
                      <span style={{ color: "var(--text-muted, #7a8fa6)" }}>Email: </span>
                      <span style={{ color: "#fff" }}>{order.shipping.email}</span>
                    </div>
                  )}
                  <div>
                    <span style={{ color: "var(--text-muted, #7a8fa6)" }}>Địa chỉ nhận: </span>
                    <span style={{ color: "#fff" }}>
                      {order.shipping.street}, {order.shipping.district}, {order.shipping.province}
                    </span>
                  </div>
                  {order.shipping.note && (
                    <div>
                      <span style={{ color: "var(--text-muted, #7a8fa6)" }}>Ghi chú: </span>
                      <span style={{ color: "#fbbf24" }}>{order.shipping.note}</span>
                    </div>
                  )}
                </div>

                {/* DANH SÁCH LINH KIỆN MUA */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
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
                          width: 44,
                          height: 44,
                          borderRadius: 6,
                          background: "#04070e",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = "/assets/products/Microcontrollers.png";
                            }}
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                        ) : (
                          <span style={{ fontSize: "20px" }}>🔌</span>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: MONO, fontSize: "0.85rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted, #7a8fa6)" }}>
                          {vnd(item.price)} × {item.quantity}
                        </div>
                      </div>

                      <div style={{ fontFamily: MONO, fontSize: "0.88rem", fontWeight: 700, color: "var(--accent, #00e5ff)" }}>
                        {vnd(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* BẢNG TỔNG TIỀN */}
                <div style={{ display: "grid", gap: 10, borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted, #7a8fa6)" }}>
                    <span>Tạm tính tiền hàng:</span>
                    <span style={{ fontFamily: MONO, color: "#fff" }}>{vnd(order.subtotal)}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted, #7a8fa6)" }}>
                    <span>Phí vận chuyển:</span>
                    <span style={{ fontFamily: MONO, color: order.shippingFee === 0 ? "#00ff88" : "#fff" }}>
                      {order.shippingFee === 0 ? "Miễn phí" : vnd(order.shippingFee)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "1.15rem",
                      fontWeight: 800,
                      color: "#fff",
                      borderTop: "1px dashed rgba(255, 255, 255, 0.15)",
                      paddingTop: 12,
                      marginTop: 4,
                    }}
                  >
                    <span>Tổng tiền thanh toán:</span>
                    <span style={{ fontFamily: MONO, color: "var(--accent, #00e5ff)", fontSize: "1.3rem" }}>
                      {vnd(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* NÚT ĐIỀU HƯỚNG */}
                <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
                  <Link
                    to="/shop"
                    style={{
                      flex: 1,
                      textAlign: "center",
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#fff",
                      padding: "12px",
                      borderRadius: 8,
                      fontFamily: MONO,
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      textDecoration: "none",
                    }}
                  >
                    ← Tiếp tục mua sắm
                  </Link>
                  <Link
                    to="/"
                    style={{
                      flex: 1,
                      textAlign: "center",
                      background: "var(--accent, #00e5ff)",
                      color: "#030712",
                      padding: "12px",
                      borderRadius: 8,
                      fontFamily: MONO,
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      textDecoration: "none",
                    }}
                  >
                    Về trang chủ →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
