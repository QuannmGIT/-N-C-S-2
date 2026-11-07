import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { usePageStylesheets } from "../lib/usePageStyles.js";
import { api } from "../lib/api.js";

export default function SignupPage() {
  const ready = usePageStylesheets(["/styles/variant/auth.css"]);
  const [alertMsg, setAlertMsg] = useState(null);
  const [alertType, setAlertType] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const showAlert = (msg, type) => {
    setAlertMsg(msg);
    setAlertType(type);
  };

  useEffect(() => {
    document.title = "Đăng ký - VoltCore";
    document.documentElement.lang = "vi";
  }, []);

  if (!ready) return null;

  const onSubmit = async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // identical client-side validation to the original signup.html
    if (username.length < 3)
      return showAlert("Tên đăng nhập phải có ít nhất 3 ký tự", "error");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return showAlert("Email không hợp lệ", "error");
    if (password.length < 6)
      return showAlert("Mật khẩu phải có ít nhất 6 ký tự", "error");
    if (password !== confirmPassword)
      return showAlert("Mật khẩu xác nhận không khớp", "error");

    setBusy(true);
    try {
      const res = await api("/api/auth/signup", {
        username,
        email,
        password,
        confirmPassword,
      });
      if (!res.ok) {
        showAlert(res.data.error || "Đăng ký thất bại", "error");
      } else {
        showAlert("Đăng ký thành công! Đang chuyển hướng...", "success");
        setTimeout(() => navigate("/"), 800);
      }
    } catch {
      showAlert("Không thể kết nối server", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Navbar
        logo="icon"
        links={[]}
        showAuth={false}
        right={
          <>
            <Link to="/">Home</Link>
            <Link to="/shop">Products</Link>
            <Link to="/signup" className="active">
              Sign up
            </Link>
          </>
        }
      />

      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-badge">
              <span className="badge-dot"></span> Join VoltCore
            </div>
            <h1>
              Create <span>Account</span>
            </h1>
            <p>Tạo tài khoản để lưu sản phẩm yêu thích và theo dõi đơn hàng</p>
          </div>

          {alertMsg && <div className={`alert ${alertType}`}>{alertMsg}</div>}

          <form id="signupForm" onSubmit={onSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Tối thiểu 3 ký tự"
                autoComplete="username"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="ban@email.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                required
              />
            </div>
            <button type="submit" className="btn-auth" disabled={busy}>
              {busy ? "Đang xử lý..." : "Đăng ký →"}
            </button>
          </form>

          <div className="auth-switch">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </div>
      </div>

      <Footer variant="auth" />
    </>
  );
}
