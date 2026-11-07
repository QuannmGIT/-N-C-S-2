import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { usePageStylesheets } from "../lib/usePageStyles.js";
import { useApi } from "../lib/useApi.js";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import { dateLabel } from "../lib/format.js";

/*
 * /account —"Quản lý tài khoản" from the use-case spec. Built on the auth.css
 * look (same wrapper/cards/alerts as login & signup), backed by the ready
 * endpoints: GET /api/auth/me (profile), POST /api/auth/change-password,
 * GET /api/auth/users (community directory). Order history lands here once
 * the checkout milestone adds /api/orders.
 */

const MONO = "'JetBrains Mono', monospace";

function Profile() {
  // context holds only { username } right after login, so /me supplies the
  // full row (email, created_at)
  const me = useApi("/api/auth/me");
  const info = me.data?.loggedIn ? me.data : null;

  return (
    <>
      <div className="auth-header">
        <div className="auth-badge">
          <span className="badge-dot"></span> My Account
        </div>
        <h1>
          Member <span>Profile</span>
        </h1>
      </div>

      <div
        className="meta-avatar"
        style={{ width: 72, height: 72, margin: "0 auto 18px" }}
      >
        <img
          src="/assets/icons/userlogo.svg"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gap: 10,
          fontFamily: MONO,
          fontSize: "0.85rem",
        }}
      >
        <div>
          <span style={{ color: "var(--text-muted)" }}>Tên đăng nhập: </span>
          <strong style={{ color: "var(--accent)" }}>
            {info?.username ?? "…"}
          </strong>
        </div>
        {info ? (
          <>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Email: </span>
              {info.email}
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>
                Thành viên từ:{" "}
              </span>
              {dateLabel(info.created_at)}
            </div>
          </>
        ) : (
          me.loading && (
            <div style={{ color: "var(--text-muted)" }}>Đang tải hồ sơ…</div>
          )
        )}
        <div
          style={{
            color: "var(--text-muted)",
            fontSize: "0.78rem",
            lineHeight: 1.5,
          }}
        >
          Đơn hàng của bạn sẽ hiển thị tại đây sau khi tính năng Đặt hàng ra
          mắt.
        </div>
      </div>
    </>
  );
}

/** Community directory — GET /api/auth/users (its own hook lives here). */
function Members() {
  const users = useApi("/api/auth/users");
  const list = users.data ?? [];

  return (
    <div
      className="auth-card"
      style={{ padding: "26px 32px", width: "100%", maxWidth: 560 }}
    >
      <h2
        style={{
          fontFamily: MONO,
          fontSize: "0.9rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        Community{" "}
        <span style={{ color: "var(--accent)" }}>· {list.length || "…"}</span>
      </h2>
      {users.error ? (
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
          {users.error}
        </p>
      ) : list.length === 0 ? (
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
          Đang tải danh sách thành viên…
        </p>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {list.slice(0, 8).map((u) => (
            <div
              key={u.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontFamily: MONO,
                fontSize: "0.82rem",
                borderBottom: "1px dashed var(--border)",
                paddingBottom: 8,
              }}
            >
              <span>@{u.username}</span>
              <span style={{ color: "var(--text-muted)" }}>
                {dateLabel(u.created_at)}
              </span>
            </div>
          ))}
          {list.length > 8 ? (
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              +{list.length - 8} thành viên khác
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  const ready = usePageStylesheets(["/styles/variant/auth.css"]);
  const { user, ready: authReady, logout } = useAuth();
  const navigate = useNavigate();

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [alertMsg, setAlertMsg] = useState(null);
  const [alertType, setAlertType] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Tài khoản - VoltCore";
    document.documentElement.lang = "vi";
  }, []);

  // Hard-reload guard: wait until the session check finished before deciding
  // the user is really logged out (the context user starts null on boot).
  useEffect(() => {
    if (authReady && !user) {
      navigate("/login", { state: { next: "/account" } });
    }
    // (all hooks run before this early return — rules of hooks)
  }, [authReady, user, navigate]);

  if (!ready || !authReady || !user) return null;

  const showAlert = (msg, type) => {
    setAlertMsg(msg);
    setAlertType(type);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) {
      return showAlert("Mật khẩu xác nhận không khớp", "error");
    }
    setBusy(true);
    try {
      const res = await api("/api/auth/change-password", {
        currentPassword: pw.current,
        newPassword: pw.next,
        confirmPassword: pw.confirm,
      });
      if (!res.ok) {
        showAlert(res.data.error || "Đổi mật khẩu thất bại", "error");
      } else {
        showAlert("Đổi mật khẩu thành công!", "success");
        setPw({ current: "", next: "", confirm: "" });
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
            <Link to="/account" className="active">
              Account
            </Link>
          </>
        }
      />

      <div className="auth-wrapper" style={{ alignItems: "flex-start" }}>
        <div style={{ width: "100%", maxWidth: 560, display: "grid", gap: 20 }}>
          <div className="auth-card" style={{ padding: "30px 32px" }}>
            <Profile />
            <button
              className="btn-auth"
              style={{ marginTop: 22 }}
              onClick={logout}
            >
              Đăng xuất
            </button>
          </div>

          <div className="auth-card" style={{ padding: "30px 32px" }}>
            <div className="auth-header">
              <div className="auth-badge">
                <span className="badge-dot"></span> Security
              </div>
              <h1>
                Change <span>Password</span>
              </h1>
              <p>Quản lý tài khoản · đổi mật khẩu của bạn</p>
            </div>

            {alertMsg && <div className={`alert ${alertType}`}>{alertMsg}</div>}

            <form onSubmit={onSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={pw.current}
                  onChange={(e) => setPw({ ...pw, current: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">Mật khẩu mới</label>
                <input
                  type="password"
                  id="newPassword"
                  value={pw.next}
                  onChange={(e) => setPw({ ...pw, next: e.target.value })}
                  placeholder="Tối thiểu 6 ký tự"
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                  placeholder="Nhập lại mật khẩu mới"
                  autoComplete="new-password"
                  required
                />
              </div>
              <button type="submit" className="btn-auth" disabled={busy}>
                {busy ? "Đang xử lý..." : "Cập nhật mật khẩu →"}
              </button>
            </form>
          </div>

          <Members />
        </div>
      </div>

      <Footer variant="auth" />
    </>
  );
}
