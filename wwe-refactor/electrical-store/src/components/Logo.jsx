import { Link, useNavigate } from "react-router-dom";
import logo from "/assets/brand/logo.svg";

/**
 * QuantumCore logo — matches the two markups the static pages used:
 *
 *  - "icon" (style.css / auth.css pages: Home, Shop, Login, Signup):
 *    the original was `<div class="logo" style="cursor:pointer"
 *    onclick="location.href='main.html'">` — a plain div, NOT an anchor.
 *    style.css has no `text-decoration` for .logo (no global a reset either),
 *    so rendering a real <a> here would add the browser-default underline.
 *    We therefore keep a div and navigate imperatively, CSS-included.
 *
 *  - "mark" (blog.css / prj.css pages: Blog, Post, Projects):
 *    the original was `<a href="main.html" class="logo">` and those stylesheets
 *    already set `text-decoration: none` on .logo — a react-router <Link> is
 *    the exact equivalent.
 */
export default function Logo({ variant = "icon", href = "/" }) {
  const navigate = useNavigate();

  if (variant === "icon") {
    return (
      <div
        className="logo"
        style={{ cursor: "pointer" }}
        onClick={() => navigate(href)}
      >
        <div className="logo-icon">
          <img src={logo} alt="VoltCore Logo" />
        </div>
        Volt<span>Core</span>
      </div>
    );
  }

  return (
    <Link className="logo" to={href}>
      <div className="logo-mark">
        <img src={logo} alt="VoltCore Logo" />
      </div>
      Volt<span>Core</span>
    </Link>
  );
}
