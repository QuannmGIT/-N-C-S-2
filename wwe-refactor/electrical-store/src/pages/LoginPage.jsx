import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { usePageStylesheets } from "../lib/usePageStyles.js";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import logoImg from "/assets/brand/logo.svg";

export default function LoginPage() {
  const ready = usePageStylesheets(["/styles/variant/auth.css"]);
  const { user, setUser, logout } = useAuth();
  const [alertMsg, setAlertMsg] = useState(null);
  const [alertType, setAlertType] = useState("");
  const [busy, setBusy] = useState(false);

  // Google OAuth Real API State
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const navigate = useNavigate();
  const next = useLocation().state?.next ?? "/";

  const showAlert = (msg, type) => {
    setAlertMsg(msg);
    setAlertType(type);
  };

  useEffect(() => {
    document.title = "Đăng nhập - VoltCore";
    document.documentElement.lang = "vi";

    // 1. Kiểm tra kết quả trả về từ Google OAuth redirect callback
    const searchParams = new URLSearchParams(window.location.search);
    const googleLoginStatus = searchParams.get("google_login");
    const authError = searchParams.get("error");

    if (googleLoginStatus === "success") {
      api("/api/auth/me").then((res) => {
        if (res.ok && res.data?.loggedIn) {
          setUser({ username: res.data.username, email: res.data.email });
          showAlert(
            `Đăng nhập Google thành công! Chào mừng @${res.data.username}`,
            "success",
          );
          setTimeout(() => navigate(next), 1000);
        }
      });
    } else if (authError) {
      showAlert(decodeURIComponent(authError), "error");
    }

    // 2. Kiểm tra xem Backend đã cấu hình Google Client ID hay chưa
    api("/api/auth/google/config").then((res) => {
      if (res.ok && res.data?.configured) {
        setGoogleConfigured(true);
        const clientId = res.data.clientId;

        // Khởi tạo Google Platform / Identity Services
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              setBusy(true);
              try {
                const authRes = await api("/api/auth/google", {
                  credential: response.credential,
                });
                if (authRes.ok) {
                  setUser({
                    username: authRes.data.username,
                    email: authRes.data.email,
                  });
                  showAlert(
                    `Đăng nhập Google thành công! Chào mừng @${authRes.data.username}`,
                    "success",
                  );
                  setTimeout(() => navigate(next), 800);
                } else {
                  showAlert(
                    authRes.data?.error || "Đăng nhập Google thất bại",
                    "error",
                  );
                }
              } catch {
                showAlert("Không thể kết nối đến máy chủ", "error");
              } finally {
                setBusy(false);
              }
            },
          });
        }
      }
    });
  }, []);

  if (!ready) return null;

  // Khi click nút "Đăng nhập bằng Google" -> Gọi trực tiếp Google API
  const onGoogleBtnClick = () => {
    if (!googleConfigured) {
      // Nếu chưa cấu hình Client ID trong server/.env, hiện hướng dẫn
      setShowConfigModal(true);
      return;
    }

    // Nếu Google Identity Services đã nạp xong trên trình duyệt
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Chuyển hướng Google OAuth 2.0 chuẩn nếu popup bị đóng
          window.location.href = "/api/auth/google";
        }
      });
    } else {
      setBusy(true);
      // Chuyển hướng trình duyệt đến endpoint OAuth của Google: https://accounts.google.com
      window.location.href = "/api/auth/google";
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api("/api/auth/login", {
        username: document.getElementById("username").value.trim(),
        password: document.getElementById("password").value,
      });
      if (!res.ok) {
        showAlert(res.data.error || "Đăng nhập thất bại", "error");
      } else {
        setUser({ username: res.data.username });
        showAlert("Đăng nhập thành công! Đang chuyển hướng...", "success");
        setTimeout(() => navigate(next), 800);
      }
    } catch {
      showAlert("Không thể kết nối server", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className={`welcome-bar${user ? " show" : ""}`}>
        Xin chào, <strong>{user?.username}</strong>
        <button onClick={logout}>Đăng xuất</button>
      </div>

      <Navbar
        logo="icon"
        links={[]}
        showAuth={false}
        right={
          <>
            <Link to="/">Home</Link>
            <Link to="/shop">Products</Link>
            <Link to="/login" className="active">
              Login
            </Link>
          </>
        }
      />

      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-badge">
              <span className="badge-dot"></span> Secure Access
            </div>
            <h1>
              Welcome <span>Back</span>
            </h1>
            <p>
              Đăng nhập để tiếp tục khám phá linh kiện điện tử tại VoltCore
            </p>
          </div>

          {alertMsg && <div className={`alert ${alertType}`}>{alertMsg}</div>}

          <form id="loginForm" onSubmit={onSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập hoặc Email</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="vd: nguyenvanA"
                autoComplete="username"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" className="btn-auth" disabled={busy}>
              {busy ? "Đang xử lý..." : "Đăng nhập →"}
            </button>
          </form>

          {/* ĐƯỜNG PHÂN CÁCH */}
          <div className="divider">
            <span>hoặc</span>
          </div>

          {/* NÚT ĐĂNG NHẬP BẰNG GOOGLE */}
          <button
            type="button"
            className="btn-google"
            onClick={onGoogleBtnClick}
            disabled={busy}
          >
            <svg viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Đăng nhập bằng Google</span>
          </button>

          <div className="auth-switch">
            Chưa có tài khoản? <Link to="/signup">Đăng ký ngay</Link>
          </div>
        </div>
      </div>

      {/* MODAL HƯỚNG DẪN KHI CHƯA CẤU HÌNH GOOGLE_CLIENT_ID */}
      {showConfigModal && (
        <div
          className="google-oauth-overlay"
          onClick={() => setShowConfigModal(false)}
        >
          <div
            className="google-oauth-card"
            style={{ maxWidth: 540, padding: "28px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <h2
                style={{
                  fontSize: "1.25rem",
                  color: "#e3e3e3",
                  fontWeight: 500,
                }}
              >
                Kết nối với Google API
              </h2>
            </div>

            <p
              style={{
                fontSize: "0.86rem",
                color: "#c4c7c5",
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              Để gọi trực tiếp API của Google (mở trang đăng nhập chính thức của
              Google tại <code>accounts.google.com</code>), bạn cần cấu hình{" "}
              <strong>Google Client ID</strong> trong file cấu hình:
            </p>

            <div
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid #3c4043",
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: 16,
                fontSize: "0.82rem",
                color: "#a8c7fa",
                lineHeight: 1.6,
              }}
            >
              1. Truy cập <strong>console.cloud.google.com</strong><br />
              2. Tạo Credentials → <strong>OAuth 2.0 Client ID</strong> (Web application)<br />
              3. Thêm URI chuyển hướng:{" "}
              <code>http://localhost:3000/api/auth/google/callback</code><br />
              4. Dán Client ID vào file <code>wwe-refactor/server/.env</code>
            </div>

            <div className="google-oauth-actions" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="google-btn-cancel"
                onClick={() => setShowConfigModal(false)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="google-btn-continue"
                onClick={() => {
                  window.location.href = "/api/auth/google";
                }}
              >
                Thử gọi Google API ngay →
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer variant="auth" />
    </>
  );
}
