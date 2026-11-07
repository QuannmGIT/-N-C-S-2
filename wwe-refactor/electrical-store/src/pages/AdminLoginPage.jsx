import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { usePageStylesheets } from "../lib/usePageStyles.js";

export default function AdminLoginPage() {
  const ready = usePageStylesheets(["/styles/variant/auth.css"]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alertMsg, setAlertMsg] = useState(null);
  const [alertType, setAlertType] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Dev/Admin Login - VoltCore";
    // Kiểm tra xem đã đăng nhập admin chưa
    api("/api/admin/me").then((res) => {
      if (res.ok && res.data.loggedIn) {
        navigate("/admin");
      }
    });
  }, [navigate]);

  if (!ready) return null;

  const showAlert = (msg, type) => {
    setAlertMsg(msg);
    setAlertType(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      showAlert("Vui lòng điền đầy đủ tài khoản và mật khẩu", "error");
      return;
    }

    setBusy(true);
    try {
      const res = await api("/api/admin/login", {
        username: username.trim(),
        password,
      });

      if (!res.ok) {
        showAlert(res.data?.error || "Đăng nhập thất bại", "error");
      } else {
        showAlert("Xác thực Dev/Admin thành công! Đang chuyển hướng...", "success");
        setTimeout(() => navigate("/admin"), 700);
      }
    } catch {
      showAlert("Không thể kết nối đến máy chủ", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #0f1c2e 0%, #080c10 100%)",
        color: "#e8edf2",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "linear-gradient(145deg, #0e1520, #141f2d)",
          border: "1px solid rgba(0, 229, 255, 0.25)",
          borderRadius: "18px",
          padding: "36px 30px",
          boxShadow: "0 12px 40px rgba(0, 229, 255, 0.08), 0 0 20px rgba(0,0,0,0.6)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top Accent Line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, #00e5ff, #00ff88)",
          }}
        />

        <div style={{ textAlign: "center", marginBottom: "26px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 12px",
              background: "rgba(0, 255, 136, 0.08)",
              border: "1px solid rgba(0, 255, 136, 0.3)",
              borderRadius: "20px",
              fontSize: "0.74rem",
              color: "#00ff88",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#00ff88",
                boxShadow: "0 0 8px #00ff88",
              }}
            />
            DEV / ADMIN PORTAL
          </div>

          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "6px 0 8px" }}>
            VoltCore <span style={{ color: "#00e5ff" }}>Console</span>
          </h1>
          <p style={{ fontSize: "0.82rem", color: "#7a8fa6" }}>
            Trang đăng nhập dành riêng cho Lập trình viên & Quản trị viên
          </p>
        </div>

        {alertMsg && (
          <div
            className={`alert ${alertType}`}
            style={{ marginBottom: "18px", fontSize: "0.82rem" }}
          >
            {alertMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.78rem",
                color: "#7a8fa6",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Admin Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "#090d13",
                border: "1px solid rgba(0, 229, 255, 0.2)",
                borderRadius: "8px",
                color: "#00e5ff",
                fontSize: "0.9rem",
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "26px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.78rem",
                color: "#7a8fa6",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "#090d13",
                border: "1px solid rgba(0, 229, 255, 0.2)",
                borderRadius: "8px",
                color: "#00e5ff",
                fontSize: "0.9rem",
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            style={{
              width: "100%",
              padding: "13px",
              background: "linear-gradient(90deg, #00e5ff, #00ff88)",
              border: "none",
              borderRadius: "10px",
              color: "#080c10",
              fontWeight: 800,
              fontSize: "0.9rem",
              fontFamily: "inherit",
              cursor: busy ? "not-allowed" : "pointer",
              transition: "transform 0.15s, opacity 0.15s",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "Đang xác thực Console..." : "LOGIN TO DEV CONSOLE →"}
          </button>
        </form>

        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
            fontSize: "0.75rem",
            color: "#7a8fa6",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "16px",
          }}
        >
          <Link
            to="/"
            style={{ color: "#7a8fa6", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.target.style.color = "#00e5ff")}
            onMouseLeave={(e) => (e.target.style.color = "#7a8fa6")}
          >
            ← Quay lại trang chủ VoltCore
          </Link>
        </div>
      </div>
    </div>
  );
}
