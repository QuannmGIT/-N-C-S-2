import { Link } from "react-router-dom";
import logo from "/assets/brand/logo.svg";
/**
 * Three footer variants, matching the original pages:
 *  - "store": the 4-column mega footer (main.html)
 *  - "paper": the simple dark footer (blog.html / post.html), with the page's
 *    contact line passed through
 *  - "auth":  single-line footer (login.html / signup.html)
 */
export default function Footer({ variant = "paper", contactLine = "" }) {
  if (variant === "auth") {
    return (
      <footer>
        © 2026 VoltCore — Electronic Components. All rights reserved.
      </footer>
    );
  }

  if (variant === "store") {
    return (
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-icon">
                <img src={logo} alt="VoltCore Logo" />
              </div>
              Volt<span>Core</span>
            </div>
            <p>
              Leading supplier of electronic components and technology solutions
              in Vietnam. We accompany the community of engineers and makers.
            </p>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              <li>
                <a href="#">New Arrivals</a>
              </li>
              <li>
                <a href="#">Best Sellers</a>
              </li>
              <li>
                <a href="#">Sale Off</a>
              </li>
              <li>
                <a href="#">Distributors</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li>
                <a href="#">Technical Documentation</a>
              </li>
              <li>
                <a href="#">Order Tracking</a>
              </li>
              <li>
                <a href="#">Return Policy</a>
              </li>
              <li>
                <a href="#">Warranty</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Information</h4>
            <ul>
              <li>
                <a href="#">About Us</a>
              </li>
              <li>
                <a href="#">Recruitment</a>
              </li>
              <li>
                <a href="/blog">Blog</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            &copy; 2026 VoltCore — Electronic Components. All rights
            reserved.
          </p>
          <div className="footer-bottom-links">
            <a href="#">Terms of Use</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer>
      <div className="footer-top">
        <Link to="/" className="footer-logo">
          <div className="logo-mark">
            <img src={logo} alt="VoltCore Logo" />
          </div>
          Volt<span>Core</span>
        </Link>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/#product-section">Products</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/#contact-section">Contact</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 VoltCore. All rights reserved.</p>
        <p>{contactLine}</p>
      </div>
    </footer>
  );
}
