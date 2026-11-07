import { ApiError } from "./error.js";

/**
 * Tiny fixed-window in-memory rate limiter (no external deps).
 *
 * Keyed by request IP, enough for a single-process dev/small-deploy server.
 * If the app is ever clustered or load-balanced, swap in
 * express-rate-limit with a shared store (Redis/SQLite) instead.
 */
export default function fixedWindowLimiter({
  windowMs = 15 * 60 * 1000,
  max = 10,
  message = "Quá nhiều yêu cầu, vui lòng thử lại sau.",
} = {}) {
  // key -> { count, expiresAt }
  const hits = new Map();

  function sweepExpired(now) {
    for (const [key, entry] of hits) {
      if (entry.expiresAt <= now) hits.delete(key);
    }
  }

  return function rateLimit(req, res, next) {
    const now = Date.now();
    if (hits.size > 1000) sweepExpired(now);

    const key = req.ip ?? "unknown";
    const entry = hits.get(key);

    if (!entry || entry.expiresAt <= now) {
      hits.set(key, { count: 1, expiresAt: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      return next(ApiError.tooManyRequests(message));
    }
    next();
  };
}
