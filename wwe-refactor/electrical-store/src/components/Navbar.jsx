import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import AuthStatus from './AuthStatus.jsx'

function NavLink({ to, active, children }) {
  // In-page anchors (e.g. "#categories-section") stay plain <a> like the original.
  if (to.startsWith('#')) {
    return <a href={to} className={active ? 'active' : undefined}>{children}</a>
  }
  return <Link to={to} className={active ? 'active' : undefined}>{children}</Link>
}

/**
 * Fixed top navbar. Each page passes exactly the links / right-hand slot its
 * original HTML had, so the per-page CSS keeps styling it correctly:
 *  - variant "icon": Home, Shop, Login, Signup (style.css / auth.css)
 *  - variant "mark": Blog, Post, Projects (blog.css / prj.css)
 * `right` can be the search bar (Home), the cart button (Shop), a .nav-cta
 * (Blog / Post / Projects) or plain links (Login / Signup).
 * `showAuth` (default true) appends the global login chip / user+logout slot
 * to `nav-right`; pages that provide their own auth UI pass false.
 */
export default function Navbar({ logo = 'mark', links = [], right = null, logoHref = '/', showAuth = true }) {
  return (
    <nav>
      <Logo variant={logo} href={logoHref} />
      <ul className="nav-links">
        {links.map((l) => (
          <li key={l.label}><NavLink to={l.to} active={l.active}>{l.label}</NavLink></li>
        ))}
      </ul>
      <div className="nav-right" style={{ display: 'flex', alignItems: 'center' }}>
        {right}
        {showAuth ? <AuthStatus /> : null}
      </div>
    </nav>
  )
}
