import express from "express";
import session from "express-session";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { config } from "./config.js";
import authRouter from "./auth/route.js";
import catalogRouter from "./catalog/route.js";
import { errorHandler } from "./handler/error-handler.js";
import { ApiError } from "./handler/error.js";

// Built SPA (the electrical-store's `vite build` output). Optional: without a
// build present, the server simply runs as the API-only backend.
const DIST = join(import.meta.dirname, "../../electrical-store/dist");
const hasSpa = existsSync(join(DIST, "index.html"));

export default function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    session({
      store: config.store,
      secret: config.secret,
      resave: config.resave,
      saveUninitialized: config.saveUninitialized,
      cookie: config.cookie,
    }),
  );
  app.get("/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.use("/api/auth", authRouter); // documented API namespace for external clients
  app.use("/api", catalogRouter); // storefront catalogue (public, read-only)

  if (hasSpa) {
    // Serve the built SPA: hashed JS bundles plus the verbatim public/ copies
    // (styles/, assets/, favicon.svg) that Vite places inside dist/.
    app.use(express.static(DIST));

    // SPA history fallback: hard reloads of /shop, /blog/:slug, … must return
    // index.html so the client router can take over. Express 5 removed the
    // app.get("*") wildcard, so this is plain middleware instead. Non-GET/HEAD
    // and API requests keep falling through to the 404 handler below.
    app.use((req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      if (req.path.startsWith("/api") || req.path === "/health") return next();
      res.sendFile(join(DIST, "index.html"));
    });
  }

  app.use((req, res, next) => {
    next(ApiError.notFound(`Route ${req.method} ${req.path} not found`));
  });
  app.use(errorHandler);
  return app;
}
