export function buildQuery(params) {
  if (!params) return '';
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

export async function api(path, body, signal) {
  const res = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  })
  let data = await res.json().catch(() => ({}))
  // Server errors arrive as { error: { code, message } } — flatten so pages
  // can keep treating `data.error` as a display string.
  if (data?.error && typeof data.error !== 'string') {
    data = { ...data, error: data.error.message ?? 'Yêu cầu thất bại' }
  }
  return { ok: res.ok, data }
}

// GET with query params: apiGet('/api/products', { q: 'esp', limit: 12 })
export async function apiGet(path, params, signal) {
  return api(path + buildQuery(params), undefined, signal)
}
