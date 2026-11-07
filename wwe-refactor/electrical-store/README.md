# QuantumCore — React rewrite

React + Vite + react-router conversion of the static multi-page QuantumCore site
(`../old/main.html`, `shop.html`, `blog.html`, `post.html`, `project.html`,
`login.html`, `signup.html`), built to preserve the original styling exactly:
the real CSS files are served verbatim from `public/styles/` and
loaded/unloaded per route at runtime (`src/lib/usePageStyles.js`), and the
inline `<style>` blocks from shop/blog/post pages were ported verbatim into
`public/styles/*-page.css`. `src/index.css` is intentionally empty.

## Styling layout

- `public/styles/variant/{style,blog,prj,auth}.css` — the original page CSS;
  one link set per route (see the table below)
- `public/styles/{shop,post,blog}-page.css` — the inline `<style>` blocks those
  three original pages carried in their HTML
- `public/assets/{products,posts,icons,brand}/` — every image the site shows;
  referenced by root-absolute URLs from JSX and the server seed data

Pages load stylesheets at runtime, one page at a time, to keep the original
per-page cascade authoritative (merging all four would create cross-page
overrides). `usePageStyles.js` warns on the console when a stylesheet URL
fails, so dead hrefs can never be silent again.

## Run

Needs Node ≥ 23.4 (server uses `node:sqlite`).

```sh
# dev: two processes
cd server            && npm install && npm run dev   # API on :3000
cd electrical-store  && bun install && bun run dev   # SPA on :5173 (proxies /api)

# production: build once, then one process serves the API + the built SPA
cd electrical-store  && bun run build               # writes dist/
cd server            && npm start                    # serves dist/ + /api on :3000
```

The SPA build is optional for the server: with no `dist/` present it runs as an
API-only backend. In production set `SESSION_SECRET` (a random 32-byte hex
string) or startup fails by design.

## Routes → original pages

| Route         | Replaces       | Stylesheets loaded               |
| ------------- | -------------- | -------------------------------- |
| `/`           | main.html      | `/styles/variant/style.css`      |
| `/shop`       | shop.html      | `style.css` + `shop-page.css`    |
| `/blog`       | blog.html      | `blog.css` + `blog-page.css`     |
| `/blog/:slug` | post.html?id=… | `post-page.css` (self-contained) |
| `/projects`   | project.html   | `/styles/variant/prj.css`        |
| `/login`      | login.html     | `/styles/variant/auth.css`       |
| `/signup`     | signup.html    | `/styles/variant/auth.css`       |
| `/account`    | — (new)        | `/styles/variant/auth.css`       |

Unknown routes redirect to `/`. The server has an SPA history fallback, so
hard reloads of any route return `index.html`. `/account` is member-only: it
redirects to `/login` (and returns to itself after login) when no session is
present, and won't bounce on a hard reload while the session check is still
running. The navbar carries a global auth slot (`AuthStatus`): a `Login`
link when signed out, `Hi, <user> · Logout` plus a link to `/account` when
signed in (login/signup pages keep their own nav instead).

## Structure

- `src/lib/usePageStyles.js` — adds/removes the stylesheet set per page (the
  mechanism that keeps the original CSS authoritative, one page at a time).
- `src/lib/` — cart store (`vc_cart` key; numeric VND `price` with a load-time
  migration from the legacy `priceRaw`/`priceNew` strings), toast, auth
  (`AuthProvider` replaces the never-shipped `js/auth-nav.js`), scroll reveal,
  formatters (`vnd`, `dateLabel`, `readsLabel`), and `useApi` — the fetch hook
  Home/Shop/Blog/Post use to load the catalogue.
- `src/components/` — Logo (div vs anchor variants, as in the originals),
  Navbar, Footer (store/paper/auth variants), Tabs, ProductCard, CartDrawer,
  AuthStatus (navbar login chip / user + logout), each page passing the nav
  content its original HTML had.
- `src/pages/` — one component per original HTML page; every catalogue-driven
  page renders live data from `/api/*` (Shop keeps its filter/search/sort/page
  state in the URL).
- `../server/` — Express API: session auth (`/api/auth/*` incl.
  signup/login/logout/me/change-password/users), SQLite session store, fixed
  window rate limiting, and (with a build present) serving the built SPA.
  The storefront catalogue is served read-only from SQLite
  (`../server/src/catalog/`): `GET /api/categories`, `GET /api/products`
  (category/q/sort/page filtering), `GET /api/products/:slug`,
  `GET /api/articles` (category/q/sort/page), `GET /api/articles/:slug`.
  Tables + seed data live in `../server/src/database/` (products, categories,
  articles; seeding is idempotent, only when tables are empty).

## Known quirks carried over from the original on purpose

- `blog.html`’s “Products” nav link went to the shop, while its footer “Products”
  pointed at `main.html#product-section` — both behaviors are preserved.
- `prj.css` `.logo-mark` references an undefined `--accent` color variable (the
  logo tile on Projects renders without a background color), exactly as in the
  static site.
