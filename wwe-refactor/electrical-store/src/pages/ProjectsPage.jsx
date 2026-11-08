import { useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import { usePageStylesheets } from "../lib/usePageStyles.js";

export default function ProjectsPage() {
  const ready = usePageStylesheets(["/styles/variant/prj.css"]);

  useEffect(() => {
    document.title = "Projects – VoltCore Electronics Components";
  }, []);

  if (!ready) return null;

  return (
    <>
      <Navbar
        logo="mark"
        links={[
          { label: "Home", to: "/" },
          { label: "Products", to: "/#product-section" },
          { label: "Projects", to: "/projects", active: true },
          { label: "Blog", to: "/blog" },
          { label: "Contact", to: "/#contact-section" },
        ]}
        right={
          <a
            href="/#product-section"
            className="nav-cta"
            style={{ marginRight: "28px" }}
          >
            Buy Components →
          </a>
        }
      />

      <section className="hero">
        <div>
          <div className="hero-label">
            $ VoltCore projects --explore <span className="blink"></span>
          </div>
          <h1>
            Vietnam
            <br />
            <span className="c">Maker</span>
            <br />
            <span className="g">Community</span>
          </h1>
          <p className="hero-desc">
            Over 200 real-world projects shared by engineers, students, and
            makers nationwide — powered by VoltCore components. Get inspired,
            fork, and build your own.
          </p>
          <div className="hero-btns">
            <button className="btn-p">Explore Projects ↓</button>
            <a href="#submit" className="btn-o">
              Submit Your Project →
            </a>
          </div>
          <div className="hero-numbers">
            <div className="h-num">
              <span className="h-num-val">214</span>
              <span className="h-num-label">Projects</span>
            </div>
            <div className="h-num">
              <span className="h-num-val">1.8K</span>
              <span className="h-num-label">Members</span>
            </div>
            <div className="h-num">
              <span className="h-num-val">98K</span>
              <span className="h-num-label">Views</span>
            </div>
            <div className="h-num">
              <span className="h-num-val">4.8★</span>
              <span className="h-num-label">Rating</span>
            </div>
          </div>
        </div>

        <div className="terminal">
          <div className="terminal-bar">
            <div className="t-dot r"></div>
            <div className="t-dot y"></div>
            <div className="t-dot g"></div>
            <span className="terminal-title">
              VoltCore_project_template.ino
            </span>
          </div>
          <div className="terminal-body">
            <div className="t-line">
              <span className="t-comment">// Smart Watering System v2.1</span>
            </div>
            <div className="t-line">
              <span className="t-comment">// Author: Sigma Skibidi</span>
            </div>
            <div className="t-line">&nbsp;</div>
            <div className="t-line">
              <span className="t-prompt">❯</span>
              <span className="t-cmd">&nbsp;#include &lt;WiFi.h&gt;</span>
            </div>
            <div className="t-line">
              <span className="t-prompt">❯</span>
              <span className="t-cmd">
                &nbsp;#include &lt;PubSubClient.h&gt;
              </span>
            </div>
            <div className="t-line">
              <span className="t-prompt">❯</span>
              <span className="t-cmd">&nbsp;#include &lt;DHT22.h&gt;</span>
            </div>
            <div className="t-line">&nbsp;</div>
            <div className="t-line">
              <span className="t-out">// Compiling project...</span>
            </div>
            <div className="t-line">
              <span className="t-out ok">✓ WiFi connected: 192.168.1.105</span>
            </div>
            <div className="t-line">
              <span className="t-out ok">
                ✓ Build successful. Upload to board...
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
