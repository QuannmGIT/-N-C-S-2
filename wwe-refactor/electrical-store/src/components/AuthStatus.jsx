import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

/*
 * Global auth slot for the navbar — the reason js/auth-nav.js exists on
 * the why-list of the original project: login state is now visible on every
 * page, not only inside the login screen's .welcome-bar.
 *
 * Styling is self-contained (no dependency on the per-page variant CSS):
 * colours are inherited from the surrounding nav so it blends with the
 * store/paper/prj/auth themes alike; --accent gets a matching fallback for
 * pages whose CSS never defined it (the prj.css --accent quirk).
 */
const MONO = "'JetBrains Mono', monospace"

const linkStyle = {
  color: 'inherit',
  textDecoration: 'none',
  fontFamily: MONO,
  fontSize: '0.85rem',
  whiteSpace: 'nowrap',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
}

const logoutStyle = {
  background: 'none',
  border: '1px solid currentColor',
  opacity: 0.75,
  borderRadius: 8,
  padding: '4px 10px',
  cursor: 'pointer',
  color: 'inherit',
  fontFamily: MONO,
  fontSize: '0.72rem',
}

export default function AuthStatus() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isBlog = location.pathname.startsWith('/blog')

  if (!user) {
    return (
      <Link to="/login" style={linkStyle}>
        Login
      </Link>
    )
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: MONO,
        fontSize: '0.8rem',
        whiteSpace: 'nowrap',
      }}
    >
      {isBlog && (
        <Link
          to="/blog/create"
          title="Đăng bài viết mới lên Blog"
          style={{
            ...linkStyle,
            fontSize: '0.75rem',
            background: 'rgba(200, 65, 15, 0.1)',
            border: '1px solid rgba(200, 65, 15, 0.35)',
            padding: '3px 8px',
            borderRadius: '6px',
            color: 'var(--accent, #ff6b35)',
            fontWeight: 700,
          }}
        >
          ✍️ Đăng bài
        </Link>
      )}
      <Link to="/account" style={linkStyle}>
        Hi, <strong style={{ color: 'var(--accent, #ff6b35)' }}>{user.username}</strong>
      </Link>
      <button onClick={logout} style={logoutStyle}>Logout</button>
    </span>
  )
}
