import { useState, useEffect } from 'react'
import favor from "/assets/icons/fav.svg"
import { vnd } from '../lib/format.js'

const PRODUCT_FALLBACK_MAP = {
  // DB Canonical Slugs
  esp32s3: "/assets/products/ESP32-S3-DevKitC-1.png",
  nano: "/assets/products/Arduino Nano Every.png",
  lora32: "/assets/products/LoRa32 SX1276 Module.png",
  ov7670: "/assets/products/Camera OV7670 Module.png",
  esp8266: "/assets/products/ESP8266 NodeMCU v3.jpg",
  oled128: "/assets/products/OLED 1.3 SH1106.png",
  tft24: "/assets/products/TFT 2.4 ILI9341.png",
  lcd16: "/assets/products/LCD 16x2 with I2C.png",
  epaper: "/assets/products/E-Paper 2.9 HAT.png",
  servo: "/assets/products/MG996R Servo Motor.png",
  stepper: "/assets/products/NEMA 17 Stepper Motor.png",
  bms3s: "/assets/products/BMS 3S 40A Module.png",
  psu: "/assets/products/RD6006 Power Supply Module.png",
  multimeter: "/assets/products/UT61E Digital Multimeter.png",
  heatgun: "/assets/products/858D Hot Air Rework.png",
  logic8: "/assets/products/Logic Analyzer 8CH.png",
  // Full name Slugs
  "esp32-s3-devkitc-1": "/assets/products/ESP32-S3-DevKitC-1.png",
  "arduino-nano-every": "/assets/products/Arduino Nano Every.png",
  "lora32-sx1276-module": "/assets/products/LoRa32 SX1276 Module.png",
  "camera-ov7670-module": "/assets/products/Camera OV7670 Module.png",
  "esp8266-nodemcu-v3": "/assets/products/ESP8266 NodeMCU v3.jpg",
  "oled-1-3-sh1106": "/assets/products/OLED 1.3 SH1106.png",
  "tft-2-4-ili9341": "/assets/products/TFT 2.4 ILI9341.png",
  "lcd-16x2-with-i2c": "/assets/products/LCD 16x2 with I2C.png",
  "e-paper-2-9-hat": "/assets/products/E-Paper 2.9 HAT.png",
  "mg996r-servo-motor": "/assets/products/MG996R Servo Motor.png",
  "nema-17-stepper-motor": "/assets/products/NEMA 17 Stepper Motor.png",
  "bms-3s-40a-module": "/assets/products/BMS 3S 40A Module.png",
  "rd6006-power-supply-module": "/assets/products/RD6006 Power Supply Module.png",
  "ut61e-digital-multimeter": "/assets/products/UT61E Digital Multimeter.png",
  "858d-hot-air-rework": "/assets/products/858D Hot Air Rework.png",
  "logic-analyzer-8ch": "/assets/products/Logic Analyzer 8CH.png",
};

export default function ProductCard({ product, onAdd, onToast }) {
  const [wished, setWished] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setImgError(false);
  }, [product?.slug, product?.img]);

  const fallbackUrl = PRODUCT_FALLBACK_MAP[product.slug] || "/assets/products/Microcontrollers.png";
  const currentImg = imgError ? fallbackUrl : (product.img || fallbackUrl);

  const toggleWish = (e) => {
    e.stopPropagation();
    const next = !wished;
    setWished(next);
    onToast?.(next ? 'Đã thêm vào mục yêu thích!' : 'Đã xóa khỏi mục yêu thích!');
  };

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
    }
  };

  // Đóng modal khi bấm phím ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showModal) setShowModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  return (
    <>
      <div className="product-card" style={{ transition: "all 0.2s ease" }}>
        <div
          className="product-img"
          onClick={() => setShowModal(true)}
          style={{ cursor: "pointer", position: "relative" }}
          title="Bấm để xem chi tiết & hình ảnh lớn"
        >
          <img
            src={currentImg}
            alt={product.name}
            className="main-img"
            onError={handleImageError}
            loading="lazy"
          />
          {product.badge ? (
            <span className={`product-badge ${product.badge}`}>{product.badge.toUpperCase()}</span>
          ) : null}
          <div className={`wishlist-btn${wished ? ' active' : ''}`} onClick={toggleWish}>
            <img src={favor} alt="Add to wishlist" />
          </div>
        </div>
        <div className="product-info">
          <span className="product-brand">{product.brand}</span>
          <h3
            className="product-name"
            onClick={() => setShowModal(true)}
            style={{ cursor: "pointer" }}
            title="Bấm để xem chi tiết sản phẩm"
          >
            {product.name}
          </h3>
          <p className="product-specs">{product.specs}</p>
          <div className="product-bottom">
            <div className="product-price">
              <span className="price-new">{vnd(product.price)}</span>
              {product.oldPrice ? <span className="price-old">{vnd(product.oldPrice)}</span> : null}
            </div>
            <button
              className="add-btn"
              onClick={(e) => {
                e.stopPropagation();
                onAdd(product, e.currentTarget);
              }}
              title="Thêm nhanh vào giỏ"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* MODAL XEM CHI TIẾT & HÌNH ẢNH SẢN PHẨM (POPUP KHI BẤM VÀO) */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(3, 7, 13, 0.82)",
            backdropFilter: "blur(8px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            style={{
              background: "#0a0f16",
              border: "1px solid rgba(0, 229, 255, 0.35)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "760px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 229, 255, 0.15)",
              position: "relative",
              color: "#e2e8f0",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            }}
          >
            {/* Nút đóng modal */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "14px",
                right: "16px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#a0aec0",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1.1rem",
                transition: "all 0.15s",
                zIndex: 10,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = "#ff4b4b";
                e.currentTarget.style.borderColor = "#ff4b4b";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = "#a0aec0";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              }}
            >
              ✕
            </button>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px",
                padding: "28px",
              }}
            >
              {/* KHUNG HÌNH ẢNH LỚN CỦA SẢN PHẨM */}
              <div
                style={{
                  background: "#05080c",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "260px",
                  position: "relative",
                }}
              >
                <img
                  src={currentImg}
                  alt={product.name}
                  onError={handleImageError}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "280px",
                    objectFit: "contain",
                    filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))",
                  }}
                />
                {product.badge && (
                  <span
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      padding: "4px 8px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      borderRadius: "4px",
                      background: product.badge === "sale" ? "#ff4b4b" : product.badge === "hot" ? "#ff9f43" : "#00ff88",
                      color: "#05080c",
                    }}
                  >
                    {product.badge.toUpperCase()}
                  </span>
                )}
                <div style={{ marginTop: "12px", fontSize: "0.72rem", color: "#64748b" }}>
                  VoltCore Authenticated Component
                </div>
              </div>

              {/* THÔNG TIN CHI TIẾT SẢN PHẨM */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "#00e5ff",
                        background: "rgba(0, 229, 255, 0.1)",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        border: "1px solid rgba(0, 229, 255, 0.25)",
                      }}
                    >
                      {product.brand || "VoltCore"}
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "#00ff88",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#00ff88",
                          display: "inline-block",
                        }}
                      />
                      {product.stock > 0 ? `Còn hàng (${product.stock})` : "Tạm hết hàng"}
                    </span>
                  </div>

                  <h2
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: "12px",
                      lineHeight: 1.35,
                    }}
                  >
                    {product.name}
                  </h2>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#00ff88" }}>
                      {vnd(product.price)}
                    </span>
                    {product.oldPrice && (
                      <span style={{ fontSize: "0.9rem", color: "#64748b", textDecoration: "line-through" }}>
                        {vnd(product.oldPrice)}
                      </span>
                    )}
                  </div>

                  {/* Thông số kỹ thuật */}
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      marginBottom: "18px",
                    }}
                  >
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, marginBottom: "6px" }}>
                      THÔNG SỐ KỸ THUẬT:
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "#cbd5e1", margin: 0, lineHeight: 1.5 }}>
                      {product.specs || "Linh kiện điện tử cao cấp, kiểm định chất lượng nghiêm ngặt bởi VoltCore Lab."}
                    </p>
                  </div>
                </div>

                {/* Bộ đếm số lượng & nút Thêm vào giỏ */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                    <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Số lượng:</span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        background: "#05080c",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "6px",
                      }}
                    >
                      <button
                        onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#fff",
                          width: "28px",
                          height: "28px",
                          cursor: "pointer",
                          fontSize: "1rem",
                        }}
                      >
                        -
                      </button>
                      <span style={{ width: "32px", textAlign: "center", fontSize: "0.85rem", fontWeight: 700 }}>
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty((prev) => prev + 1)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#fff",
                          width: "28px",
                          height: "28px",
                          cursor: "pointer",
                          fontSize: "1rem",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={(e) => {
                        for (let i = 0; i < qty; i++) {
                          onAdd(product, e.currentTarget);
                        }
                        setShowModal(false);
                      }}
                      style={{
                        flex: 1,
                        background: "#00e5ff",
                        color: "#05080c",
                        border: "none",
                        borderRadius: "8px",
                        padding: "11px 18px",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        boxShadow: "0 0 14px rgba(0, 229, 255, 0.4)",
                      }}
                    >
                      🛒 Thêm vào giỏ hàng
                    </button>
                    <button
                      onClick={toggleWish}
                      style={{
                        background: wished ? "rgba(255, 75, 75, 0.15)" : "transparent",
                        border: wished ? "1px solid #ff4b4b" : "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "8px",
                        padding: "0 14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Yêu thích"
                    >
                      <img src={favor} alt="" style={{ width: 18, height: 18 }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
